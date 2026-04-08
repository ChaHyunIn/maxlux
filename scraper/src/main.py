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
        for city in CITIES:
            log.info("city_started", city=city)
            today = date.today()
            tomorrow = today + timedelta(days=1)
            hotels_data = await hotellux.search_all_hotels(
                city, today.isoformat(), tomorrow.isoformat())
            sync_hotels(hotels_data)
            total_hotels_count += len(hotels_data)

            for day_offset in range(SCRAPE_DAYS_AHEAD):
                check_in = today + timedelta(days=day_offset)
                check_out = check_in + timedelta(days=1)
                try:
                    hotels_with_prices = await hotellux.search_all_hotels(
                        city, check_in.isoformat(), check_out.isoformat())
                    result = save_rates_from_search(
                        hotels_with_prices, check_in.isoformat())
                    total_inserted += result["inserted"]
                    total_updated += result["updated"]
                except Exception as e:
                    error_msg = f"{city}/{check_in}: {str(e)}"
                    log.error("date_failed", error=error_msg)
                    errors.append(error_msg)
                await asyncio.sleep(REQUEST_DELAY_SEC)
            log.info("city_completed", city=city)
    except Exception as e:
        log.error("run_failed", error=str(e))
        errors.append(str(e))

    status = "success" if not errors else "partial" if total_inserted > 0 else "failed"
    client.table("scrape_logs").update({
        "finished_at": datetime.utcnow().isoformat(),
        "hotels_count": total_hotels_count,
        "rates_inserted": total_inserted,
        "rates_updated": total_updated,
        "errors": errors, "status": status,
    }).eq("run_id", run_id).execute()

    log.info("run_completed", run_id=run_id, status=status,
             inserted=total_inserted, updated=total_updated, errors=len(errors))

    await hotellux.close()

if __name__ == "__main__":
    asyncio.run(run())
