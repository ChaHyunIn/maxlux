import asyncio
import uuid
from datetime import date, timedelta, datetime
from src.config import CITIES, SCRAPE_DAYS_AHEAD, REQUEST_DELAY_SEC
from src.clients.hotellux import HotelLuxClient
from src.clients.supabase_client import get_client
from src.services.hotel_sync import sync_hotels
from src.services.rate_collector import save_rates_from_search
from src.services.tagger import load_holidays
from src.utils.holidays import seed_holidays
from src.utils.logger import get_logger

log = get_logger("main")

async def run():
    run_id = str(uuid.uuid4())[:8]
    started_at = datetime.utcnow().isoformat()
    client = get_client()
    hotellux = HotelLuxClient()

    log.info("run_started", run_id=run_id, cities=CITIES, days=SCRAPE_DAYS_AHEAD)

    client.table("scrape_logs").insert({
        "run_id": run_id, "started_at": started_at, "status": "running",
    }).execute()

    # Seed holidays & load into memory once
    seed_holidays(client)
    holidays = load_holidays(client)

    total_inserted, total_updated = 0, 0
    total_hotels_count = 0
    errors = []

    try:
        semaphore = asyncio.Semaphore(5)

        for city in CITIES:
            log.info("city_started", city=city)
            today = date.today()
            tomorrow = today + timedelta(days=1)
            hotels_data = await hotellux.search_all_hotels(
                city, today.isoformat(), tomorrow.isoformat())
            sync_hotels(hotels_data)
            total_hotels_count += len(hotels_data)

            async def process_day(day_offset):
                check_in = today + timedelta(days=day_offset)
                check_out = check_in + timedelta(days=1)
                
                # Setup retries locally against DB locks and external glitches
                for i in range(3):
                    async with semaphore:
                        try:
                            hotels_with_prices = await hotellux.search_all_hotels(
                                city, check_in.isoformat(), check_out.isoformat())
                            result = save_rates_from_search(
                                hotels_with_prices, check_in.isoformat(), holidays)
                            return result, None
                        except Exception as e:
                            if i == 2:
                                log.error("date_failed", exc_info=True, city=city, date=check_in)
                                return None, {
                                    "type": type(e).__name__,
                                    "message": str(e),
                                    "context": f"{city}/{check_in}"
                                }
                            await asyncio.sleep(2 ** i)

            tasks = [process_day(i) for i in range(SCRAPE_DAYS_AHEAD)]
            results = await asyncio.gather(*tasks)

            for res, err in results:
                if err:
                    errors.append(err)
                if res:
                    total_inserted += res["inserted"]
                    total_updated += res["updated"]

            log.info("city_completed", city=city)
    except Exception as e:
        log.error("run_failed", exc_info=True, error=str(e))
        errors.append({"type": type(e).__name__, "message": str(e), "context": "global"})

    total_tasks = len(CITIES) * SCRAPE_DAYS_AHEAD
    success_rate = 1.0 - (len(errors) / total_tasks) if total_tasks else 1.0

    if success_rate < 0.7 or total_inserted == 0:
        status = "failed"
    elif errors:
        status = "partial"
    else:
        status = "success"

    if success_rate < 0.8:
        log.warning("alert", reason="Low success rate", rate=success_rate, errors=len(errors))
    if total_inserted == 0:
        log.warning("alert", reason="Zero insertions")

    client.table("scrape_logs").update({
        "finished_at": datetime.utcnow().isoformat(),
        "hotels_count": total_hotels_count,
        "rates_inserted": total_inserted,
        "rates_updated": total_updated,
        "errors": errors, "status": status,
    }).eq("run_id", run_id).execute()

    log.info("run_completed", run_id=run_id, status=status, success_rate=success_rate,
             inserted=total_inserted, updated=total_updated, errors=len(errors))

    await hotellux.close()

if __name__ == "__main__":
    asyncio.run(run())
