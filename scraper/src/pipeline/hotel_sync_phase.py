import asyncio
from datetime import date, timedelta
from src.config import CITIES
from src.services.hotel_sync import sync_hotels
from src.utils.logger import get_logger

log = get_logger("hotel_sync_phase")

async def run_hotel_sync(hotellux_client, errors):
    total_hotels_count = 0
    today = date.today()
    tomorrow = today + timedelta(days=1)
    
    for city in CITIES:
        log.info("hotel_sync_started", city=city)
        try:
            hotels_data = await hotellux_client.search_all_hotels(
                city, today.isoformat(), tomorrow.isoformat()
            )
            await asyncio.to_thread(sync_hotels, hotels_data)
            total_hotels_count += len(hotels_data)
            log.info("hotel_sync_done", city=city, count=len(hotels_data))
        except Exception as e:
            log.error("hotel_sync_failed", city=city, error=str(e))
            if len(errors) < 1000:
                errors.append({"type": type(e).__name__, "message": str(e), "context": f"sync/{city}"})

    return total_hotels_count
