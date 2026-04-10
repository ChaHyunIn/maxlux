import asyncio
from datetime import UTC, datetime, timedelta

from src.config import DETAIL_SCRAPE_DAYS_AHEAD
from src.services.rate_collector import save_room_rates
from src.utils.logger import get_logger

log = get_logger("rate_collection_phase")


async def run_rate_collection(client, hotellux_client, holidays, errors):
    hotels_res = (
        client.table("hotels")
        .select("id, hotellux_id, name_en")
        .eq("is_active", True)
        .not_.is_("hotellux_id", "null")
        .execute()
    )

    all_hotels = hotels_res.data or []
    log.info("detail_scrape_starting", hotels=len(all_hotels), days=DETAIL_SCRAPE_DAYS_AHEAD)

    semaphore = asyncio.Semaphore(5)
    today = datetime.now(UTC).date()

    async def process_hotel_day(hotel_row, day_offset):
        check_in = today + timedelta(days=day_offset)
        check_out = check_in + timedelta(days=1)
        hotel_uuid = hotel_row["id"]
        hotellux_id = hotel_row["hotellux_id"]

        for attempt in range(3):
            try:
                async with semaphore:
                    api_response = await hotellux_client.get_hotel_rates(
                        hotellux_id,
                        check_in.isoformat(),
                        check_out.isoformat(),
                    )

                if api_response is None:
                    return {"room_rates_saved": 0, "daily_rates_updated": 0}, None

                result = await asyncio.to_thread(
                    save_room_rates,
                    hotel_uuid,
                    check_in.isoformat(),
                    api_response,
                    holidays,
                )
                return result, None

            except Exception as e:
                if attempt == 2:
                    log.error("hotel_day_failed", hotel=hotellux_id, date=str(check_in), error=str(e))
                    return None, {
                        "type": type(e).__name__,
                        "message": str(e),
                        "context": f"{hotel_row.get('name_en', hotellux_id)}/{check_in}",
                    }
                await asyncio.sleep(2**attempt)

    all_tasks = []
    for hotel_row in all_hotels:
        for day_offset in range(DETAIL_SCRAPE_DAYS_AHEAD):
            all_tasks.append((hotel_row, day_offset))

    log.info("total_tasks", count=len(all_tasks))

    total_room_rates = 0
    total_daily_rates = 0
    total_processed = 0

    batch_size = 500
    for batch_start in range(0, len(all_tasks), batch_size):
        batch_items = all_tasks[batch_start : batch_start + batch_size]

        coros = [
            asyncio.wait_for(
                process_hotel_day(hotel_row, day_offset),
                timeout=120,
            )
            for hotel_row, day_offset in batch_items
        ]

        results = await asyncio.gather(*coros, return_exceptions=True)
        total_processed += len(results)

        for res_obj in results:
            if isinstance(res_obj, Exception):
                if len(errors) < 1000:
                    errors.append(
                        {
                            "type": type(res_obj).__name__,
                            "message": str(res_obj),
                            "context": "fatal",
                        }
                    )
                continue

            res, err = res_obj
            if err and len(errors) < 1000:
                errors.append(err)
            if res:
                total_room_rates += res.get("room_rates_saved", 0)
                total_daily_rates += res.get("daily_rates_updated", 0)

        log.info("batch_done", start=batch_start, size=len(batch_items), processed=total_processed)

    return total_room_rates, total_daily_rates, total_processed
