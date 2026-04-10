"""
OTA 가격 수집 오케스트레이터.

여러 OTA 소스의 가격을 수집하고 ota_prices 테이블에 저장합니다.
"""

import asyncio
from datetime import UTC, datetime, timedelta
from typing import Any

from src.clients.agoda import AgodaClient
from src.clients.booking import BookingClient
from src.clients.supabase_client import get_client
from src.utils.logger import get_logger

log = get_logger("ota_collector")

# OTA 수집은 주요 날짜만 (향후 14일)
OTA_DAYS_AHEAD = 14


async def collect_ota_prices() -> dict:
    """
    전체 OTA 가격 수집 파이프라인.
    1. DB에서 agoda_id, booking_id가 있는 호텔 조회
    2. 향후 14일에 대해 각 OTA에서 가격 수집
    3. ota_prices 테이블에 upsert
    """
    client = get_client()
    agoda = AgodaClient()
    booking = BookingClient()

    try:
        # 1. OTA ID가 있는 호텔 조회
        hotels_res = client.table("hotels").select("id, agoda_id, booking_id").eq("is_active", True).execute()

        if not hotels_res.data:
            log.warning("no_hotels_for_ota")
            return {"agoda": 0, "booking": 0}

        hotels = hotels_res.data
        agoda_hotels = [{"hotel_id": h["id"], "agoda_id": h["agoda_id"]} for h in hotels if h.get("agoda_id")]
        booking_hotels = [{"hotel_id": h["id"], "booking_id": h["booking_id"]} for h in hotels if h.get("booking_id")]

        log.info("ota_hotels_found", agoda=len(agoda_hotels), booking=len(booking_hotels))

        if not agoda_hotels and not booking_hotels:
            log.info("no_ota_ids_configured")
            return {"agoda": 0, "booking": 0}

        total_agoda = 0
        total_booking = 0
        semaphore = asyncio.Semaphore(3)

        # 2. 향후 14일 수집
        today = datetime.now(UTC).date()
        for day_offset in range(OTA_DAYS_AHEAD):
            check_in = today + timedelta(days=day_offset)
            check_out = check_in + timedelta(days=1)
            ci = check_in.isoformat()
            co = check_out.isoformat()

            # 아고다 + 부킹 병렬 수집
            tasks = []
            if agoda_hotels:
                tasks.append(agoda.get_prices_for_hotels(agoda_hotels, ci, co, semaphore))
            if booking_hotels:
                tasks.append(booking.get_prices_for_hotels(booking_hotels, ci, co, semaphore))

            results = await asyncio.gather(*tasks, return_exceptions=True)

            all_prices: list[dict[str, Any]] = []
            for i, res in enumerate(results):
                if isinstance(res, Exception):
                    source = "agoda" if i == 0 and agoda_hotels else "booking"
                    log.error("ota_day_failed", source=source, date=ci, error=str(res))
                    continue
                if res and isinstance(res, list):
                    all_prices.extend(res)

            # 3. DB upsert
            if all_prices:
                try:
                    client.table("ota_prices").upsert(
                        all_prices, on_conflict="hotel_id,stay_date,source,room_type"
                    ).execute()
                except Exception as e:
                    log.error("ota_upsert_failed", date=ci, error=str(e))

            agoda_count = len([p for p in all_prices if p.get("source") == "agoda"])
            booking_count = len([p for p in all_prices if p.get("source") == "booking"])
            total_agoda += agoda_count
            total_booking += booking_count

        log.info("ota_collection_done", agoda_total=total_agoda, booking_total=total_booking)

        return {"agoda": total_agoda, "booking": total_booking}

    finally:
        await agoda.close()
        await booking.close()
