"""
가격 알림 체크 및 이메일 발송.

스크래핑 완료 후 실행되어:
1. active 상태인 price_alerts를 조회
2. 각 알림의 target_price와 현재 최저가를 비교
3. 조건 충족 시 이메일 발송 (Resend API)
4. triggered_at 업데이트 (24시간 중복 방지)
"""
import os
import httpx
from datetime import datetime, timedelta
from src.clients.supabase_client import get_client
from src.utils.logger import get_logger

log = get_logger("alert_checker")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "alerts@maxlux.app")
SITE_URL = os.getenv("SITE_URL", "https://maxlux.app")


async def check_and_send_alerts() -> dict:
    """
    가격 알림을 체크하고 조건 충족 시 이메일 발송.
    Returns: {"checked": int, "sent": int, "skipped": int}
    """
    if not RESEND_API_KEY:
        log.info("alert_check_skipped", reason="no RESEND_API_KEY configured")
        return {"checked": 0, "sent": 0, "skipped": 0}

    client = get_client()
    checked = 0
    sent = 0
    skipped = 0

    # 1. Active 알림 조회
    alerts_res = client.table("price_alerts") \
        .select("*, hotels(name_ko, name_en, slug)") \
        .eq("is_active", True) \
        .execute()

    if not alerts_res.data:
        log.info("no_active_alerts")
        return {"checked": 0, "sent": 0, "skipped": 0}

    now = datetime.utcnow()

    for alert in alerts_res.data:
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

        # 2. 현재 최저가 조회
        rate_query = client.table("daily_rates") \
            .select("price_krw, stay_date") \
            .eq("hotel_id", hotel_id) \
            .eq("is_sold_out", False) \
            .gt("price_krw", 0) \
            .gte("stay_date", datetime.utcnow().strftime("%Y-%m-%d")) \
            .order("price_krw") \
            .limit(1)

        # Optional date range filter
        if alert.get("stay_date_from"):
            rate_query = rate_query.gte("stay_date", alert["stay_date_from"])
        if alert.get("stay_date_to"):
            rate_query = rate_query.lte("stay_date", alert["stay_date_to"])

        rate_res = rate_query.execute()

        if not rate_res.data:
            skipped += 1
            continue

        current_price = rate_res.data[0]["price_krw"]
        cheapest_date = rate_res.data[0]["stay_date"]

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
            # Update triggered_at
            client.table("price_alerts") \
                .update({"triggered_at": now.isoformat()}) \
                .eq("id", alert["id"]) \
                .execute()
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
                log.info("email_sent", to=to_email, hotel=hotel_name)
                return True
            else:
                log.error("email_failed", status=resp.status_code, body=resp.text[:200])
                return False

    except Exception as e:
        log.error("email_error", to=to_email, error=str(e))
        return False
