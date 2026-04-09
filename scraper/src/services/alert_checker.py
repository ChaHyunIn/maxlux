"""
가격 알림 체크 및 이메일 발송.

스크래핑 완료 후 실행되어:
1. active 상태인 price_alerts를 조회
2. 각 알림의 target_price와 현재 최저가를 비교
3. 조건 충족 시 이메일 발송 (Resend API)
4. triggered_at 업데이트 (24시간 중복 방지)
"""
import os
import asyncio
import httpx
from datetime import datetime, timedelta
from src.clients.supabase_client import get_client
from src.utils.logger import get_logger

log = get_logger("alert_checker")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "alerts@maxlux.app")
SITE_URL = os.getenv("SITE_URL", "https://maxlux.app")


def _mask_email(email: str) -> str:
    """PII 마스킹: abc@example.com -> a**@example.com"""
    try:
        local, domain = email.split("@", 1)
        return f"{local[0]}{'*' * min(len(local) - 1, 5)}@{domain}"
    except Exception:
        return "***@***"


def _fetch_active_alerts() -> list[dict]:
    """동기: DB에서 active 알림 목록 조회."""
    client = get_client()
    res = client.table("price_alerts") \
        .select("*, hotels(name_ko, name_en, slug)") \
        .eq("is_active", True) \
        .execute()
    return res.data or []


def _fetch_lowest_price(hotel_id: str, stay_date_from: str | None, stay_date_to: str | None) -> dict | None:
    """동기: 특정 호텔의 현재 최저가 조회."""
    client = get_client()
    query = client.table("daily_rates") \
        .select("price_krw, stay_date") \
        .eq("hotel_id", hotel_id) \
        .eq("is_sold_out", False) \
        .gt("price_krw", 0) \
        .gte("stay_date", datetime.utcnow().strftime("%Y-%m-%d")) \
        .order("price_krw") \
        .limit(1)

    if stay_date_from:
        query = query.gte("stay_date", stay_date_from)
    if stay_date_to:
        query = query.lte("stay_date", stay_date_to)

    res = query.execute()
    return res.data[0] if res.data else None


def _update_triggered_at(alert_id: int, now_iso: str):
    """동기: triggered_at 업데이트."""
    client = get_client()
    client.table("price_alerts") \
        .update({"triggered_at": now_iso}) \
        .eq("id", alert_id) \
        .execute()


async def check_and_send_alerts() -> dict:
    """
    가격 알림을 체크하고 조건 충족 시 이메일 발송.
    Returns: {"checked": int, "sent": int, "skipped": int}
    """
    if not RESEND_API_KEY:
        log.info("alert_check_skipped", reason="no RESEND_API_KEY configured")
        return {"checked": 0, "sent": 0, "skipped": 0}

    checked = 0
    sent = 0
    skipped = 0

    # 1. Active 알림 조회 (동기 IO → to_thread)
    alerts = await asyncio.to_thread(_fetch_active_alerts)

    if not alerts:
        log.info("no_active_alerts")
        return {"checked": 0, "sent": 0, "skipped": 0}

    now = datetime.utcnow()

    for alert in alerts:
        checked += 1
        hotel_id = alert["hotel_id"]
        target_price = alert["target_price"]
        email = alert["email"]
        triggered_at = alert.get("triggered_at")

        # 24시간 중복 방지
        if triggered_at:
            last_triggered = datetime.fromisoformat(triggered_at.replace("Z", "+00:00"))
            if now - last_triggered.replace(tzinfo=None) < timedelta(hours=24):
                skipped += 1
                continue

        # 2. 현재 최저가 조회 (동기 IO → to_thread)
        rate_data = await asyncio.to_thread(
            _fetch_lowest_price,
            hotel_id,
            alert.get("stay_date_from"),
            alert.get("stay_date_to"),
        )

        if not rate_data:
            skipped += 1
            continue

        current_price = rate_data["price_krw"]
        cheapest_date = rate_data["stay_date"]

        # 3. 조건 체크
        if current_price > target_price:
            skipped += 1
            continue

        # 4. 이메일 발송
        hotel_data = alert.get("hotels", {})
        hotel_name = hotel_data.get("name_ko", "호텔")
        hotel_slug = hotel_data.get("slug", "")
        alert_locale = alert.get("locale", "ko")

        success = await send_alert_email(
            to_email=email,
            hotel_name=hotel_name,
            current_price=current_price,
            target_price=target_price,
            cheapest_date=cheapest_date,
            hotel_slug=hotel_slug,
            locale=alert_locale,
        )

        if success:
            sent += 1
            await asyncio.to_thread(_update_triggered_at, alert["id"], now.isoformat())
        else:
            skipped += 1

    log.info("alert_check_done", checked=checked, sent=sent, skipped=skipped)
    return {"checked": checked, "sent": sent, "skipped": skipped}


async def send_alert_email(
    to_email: str,
    hotel_name: str,
    current_price: int,
    target_price: int,
    cheapest_date: str,
    hotel_slug: str,
    locale: str = "ko",
) -> bool:
    """Resend API를 사용하여 가격 알림 이메일을 발송합니다."""
    try:
        formatted_price = f"₩{current_price:,}"
        formatted_target = f"₩{target_price:,}"
        hotel_url = f"{SITE_URL}/hotels/{hotel_slug}"

        if locale == 'en':
            subject = f"💰 Price Alert: {hotel_name} - {formatted_price}"
            html_body = f"""
            <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">💰 Price Alert: {hotel_name}</h2>
                <p>Your target price has been reached!</p>
                <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 4px 0;"><strong>Current Lowest:</strong> {formatted_price}</p>
                    <p style="margin: 4px 0;"><strong>Target Price:</strong> {formatted_target}</p>
                    <p style="margin: 4px 0;"><strong>Date:</strong> {cheapest_date}</p>
                </div>
                <a href="{hotel_url}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Check it now →
                </a>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
                <p style="font-size: 12px; color: #94a3b8;">
                    MaxLux Price Alerts | This alert will not be resent within 24 hours.
                </p>
            </div>
            """
        else:
            subject = f"💰 {hotel_name} 가격 알림 - {formatted_price}"
            html_body = f"""
            <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">💰 가격 알림: {hotel_name}</h2>
                <p>설정하신 목표 가격에 도달했습니다!</p>
                <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 4px 0;"><strong>현재 최저가:</strong> {formatted_price}</p>
                    <p style="margin: 4px 0;"><strong>목표 가격:</strong> {formatted_target}</p>
                    <p style="margin: 4px 0;"><strong>최저가 날짜:</strong> {cheapest_date}</p>
                </div>
                <a href="{hotel_url}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    지금 확인하기 →
                </a>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
                <p style="font-size: 12px; color: #94a3b8;">
                    MaxLux 가격 알림 서비스 | 이 알림은 24시간 이내 재발송되지 않습니다.
                </p>
            </div>
            """

        async with httpx.AsyncClient(timeout=10) as http_client:
            resp = await http_client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": subject,
                    "html": html_body,
                },
            )

            if resp.status_code == 200:
                log.info("email_sent", to=_mask_email(to_email), hotel=hotel_name)
                return True
            else:
                log.error("email_failed", status=resp.status_code, body=resp.text[:200])
                return False

    except Exception as e:
        log.error("email_error", to=_mask_email(to_email), error=str(e))
        return False
