import asyncio
import uuid
from datetime import date, timedelta, datetime
from src.config import CITIES, SCRAPE_DAYS_AHEAD, REQUEST_DELAY_SEC
from src.clients.hotellux import HotelLuxClient
from src.clients.supabase_client import get_client
from src.services.hotel_sync import sync_hotels
from src.services.rate_collector import save_rates_from_search
from src.services.stats_aggregator import compress_old_data
from src.services.ota_collector import collect_ota_prices
from src.services.alert_checker import check_and_send_alerts
from src.services.tagger import load_holidays
from src.utils.holidays import seed_holidays, seed_holidays_auto
from src.utils.logger import get_logger

log = get_logger("main")


async def run():
    run_id = str(uuid.uuid4())[:8]
    started_at = datetime.utcnow().isoformat()
    client = get_client()
    hotellux = HotelLuxClient()

    try:
        log.info("run_started", run_id=run_id, cities=CITIES, days=SCRAPE_DAYS_AHEAD)

        client.table("scrape_logs").insert({
            "run_id": run_id,
            "started_at": started_at,
            "status": "running",
        }).execute()

        # Seed holidays (async API with fallback) & load into memory
        current_year = date.today().year
        await seed_holidays_auto(client, current_year)
        # Also seed next year if scraping window crosses year boundary
        if date.today().month >= 10:
            await seed_holidays_auto(client, current_year + 1)
        holidays = load_holidays(client)

        total_inserted = 0
        total_updated = 0
        total_hotels_count = 0
        total_processed_tasks = 0
        errors = []

        for city in CITIES:
            log.info("city_started", city=city)

            # city별 semaphore (병목 방지)
            semaphore = asyncio.Semaphore(5)

            today = date.today()
            tomorrow = today + timedelta(days=1)

            # 호텔 리스트 sync (thread 처리)
            hotels_data = await hotellux.search_all_hotels(
                city, today.isoformat(), tomorrow.isoformat()
            )
            await asyncio.to_thread(sync_hotels, hotels_data)
            total_hotels_count += len(hotels_data)

            async def process_day(city_arg, today_arg, day_offset):
                check_in = today_arg + timedelta(days=day_offset)
                check_out = check_in + timedelta(days=1)

                for i in range(3):
                    try:
                        # network 호출만 semaphore로 제한
                        async with semaphore:
                            hotels_with_prices = await hotellux.search_all_hotels(
                                city_arg,
                                check_in.isoformat(),
                                check_out.isoformat(),
                            )

                        # DB 작업은 thread로 분리
                        result = await asyncio.to_thread(
                            save_rates_from_search,
                            hotels_with_prices,
                            check_in.isoformat(),
                            holidays,
                        )

                        return result, None

                    except asyncio.TimeoutError:
                        if i == 2:
                            return None, {
                                "type": "Timeout",
                                "message": "request timeout",
                                "context": f"{city_arg}/{check_in}",
                            }

                    except Exception as e:
                        if i == 2:
                            log.error(
                                "date_failed",
                                exc_info=True,
                                city=city_arg,
                                date=check_in,
                            )
                            return None, {
                                "type": type(e).__name__,
                                "message": str(e),
                                "context": f"{city_arg}/{check_in}",
                            }

                    await asyncio.sleep(2 ** i)

            tasks = [
                asyncio.wait_for(
                    process_day(city, today, i),
                    timeout=120,  # 안정성 증가
                )
                for i in range(SCRAPE_DAYS_AHEAD)
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)
            total_processed_tasks += len(results)

            for res_obj in results:
                if isinstance(res_obj, Exception):
                    if len(errors) < 1000:
                        errors.append({
                            "type": type(res_obj).__name__,
                            "message": str(res_obj),
                            "context": f"{city}/fatal",
                        })
                    continue

                res, err = res_obj

                if err:
                    if len(errors) < 1000:
                        errors.append(err)

                if res:
                    total_inserted += res.get("inserted", 0)
                    total_updated += res.get("updated", 0)

            log.info("city_completed", city=city)

        # --- 결과 계산 ---
        total_tasks = total_processed_tasks if total_processed_tasks else 1
        success_rate = 1.0 - (len(errors) / total_tasks)

        if success_rate < 0.7 or total_inserted == 0:
            status = "failed"
        elif errors:
            status = "partial"
        else:
            status = "success"

        # --- ALERT ---
        if status == "failed":
            log.error("ALERT: pipeline failed", run_id=run_id)

        if success_rate < 0.8:
            log.warning(
                "alert",
                reason="Low success rate",
                rate=success_rate,
                errors=len(errors),
            )

        if total_inserted == 0:
            log.warning("alert", reason="Zero insertions")

        # --- DB 기록 ---
        try:
            client.table("scrape_logs").update({
                "finished_at": datetime.utcnow().isoformat(),
                "hotels_count": total_hotels_count,
                "rates_inserted": total_inserted,
                "rates_updated": total_updated,
                "errors": errors[:100],
                "status": status,
            }).eq("run_id", run_id).execute()
        except Exception as db_e:
            log.error("scrape_log_update_failed", exc_info=True, error=str(db_e))

        log.info(
            "run_completed",
            run_id=run_id,
            status=status,
            success_rate=success_rate,
            inserted=total_inserted,
            updated=total_updated,
            errors=len(errors),
        )

        # Post-scrape: OTA price collection (agoda, booking)
        try:
            ota_result = await collect_ota_prices()
            log.info("ota_result", **ota_result)
        except Exception as e:
            log.warning("ota_collection_failed", error=str(e))

        # Post-scrape: check price alerts and send notifications
        try:
            alert_result = await check_and_send_alerts()
            log.info("alert_result", **alert_result)
        except Exception as e:
            log.warning("alert_check_failed", error=str(e))

        # Post-scrape: compress old data (runs monthly, safe to call daily)
        try:
            compress_result = await asyncio.to_thread(compress_old_data)
            log.info("compress_result", **compress_result)
        except Exception as e:
            log.warning("compress_failed", error=str(e))

    finally:
        await hotellux.close()


if __name__ == "__main__":
    asyncio.run(run())
