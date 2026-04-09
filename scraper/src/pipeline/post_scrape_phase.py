import asyncio
from src.services.stats_aggregator import compress_old_data
from src.services.ota_collector import collect_ota_prices
from src.services.alert_checker import check_and_send_alerts
from src.utils.logger import get_logger

log = get_logger("post_scrape_phase")

async def run_post_scrape():
    try:
        ota_result = await collect_ota_prices()
        log.info("ota_result", **ota_result)
    except Exception as e:
        log.warning("ota_collection_failed", error=str(e))

    try:
        alert_result = await check_and_send_alerts()
        log.info("alert_result", **alert_result)
    except Exception as e:
        log.warning("alert_check_failed", error=str(e))

    try:
        compress_result = await asyncio.to_thread(compress_old_data)
        log.info("compress_result", **compress_result)
    except Exception as e:
        log.warning("compress_failed", error=str(e))
