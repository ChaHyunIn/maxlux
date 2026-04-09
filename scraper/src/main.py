import asyncio
import uuid
from datetime import date, timedelta, datetime
from src.config import CITIES, SCRAPE_DAYS_AHEAD, DETAIL_SCRAPE_DAYS_AHEAD, REQUEST_DELAY_SEC
from src.clients.hotellux import HotelLuxClient
from src.clients.supabase_client import get_client
from src.services.hotel_sync import sync_hotels
from src.services.rate_collector import save_rates_from_search, save_room_rates
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
        log.info("run_started", run_id=run_id, cities=CITIES, days=DETAIL_SCRAPE_DAYS_AHEAD)

        client.table("scrape_logs").insert({
            "run_id": run_id,
            "started_at": started_at,
            "status": "running",
        }).execute()

        # ── Holiday 시드 및 로드 ──
        current_year = date.today().year
        await seed_holidays_auto(client, current_year)
        if date.today().month >= 10:
            await seed_holidays_auto(client, current_year + 1)
        holidays = load_holidays(client)

        total_room_rates = 0
        total_daily_rates = 0
        total_hotels_count = 0
        total_processed = 0
        errors = []

        # ── Phase A: 호텔 리스트 동기화 (도시별 1회씩) ──
        for city in CITIES:
            log.info("hotel_sync_started", city=city)
            today = date.today()
            tomorrow = today + timedelta(days=1)
            try:
                hotels_data = await hotellux.search_all_hotels(
                    city, today.isoformat(), tomorrow.isoformat()
                )
                await asyncio.to_thread(sync_hotels, hotels_data)
                total_hotels_count += len(hotels_data)
                log.info("hotel_sync_done", city=city, count=len(hotels_data))
            except Exception as e:
                log.error("hotel_sync_failed", city=city, error=str(e))
                if len(errors) < 1000:
                    errors.append({"type": type(e).__name__, "message": str(e), "context": f"sync/{city}"})

        # ── Phase B: 호텔별 상세 요금 수집 ──
        hotels_res = client.table("hotels") \
            .select("id, hotellux_id, name_en") \
            .eq("is_active", True) \
            .not_.is_("hotellux_id", "null") \
            .execute()

        all_hotels = hotels_res.data or []
        log.info("detail_scrape_starting", hotels=len(all_hotels), days=DETAIL_SCRAPE_DAYS_AHEAD)

        semaphore = asyncio.Semaphore(5)
        today = date.today()

        async def process_hotel_day(hotel_row, day_offset):
            check_in = today + timedelta(days=day_offset)
            check_out = check_in + timedelta(days=1)
            hotel_uuid = hotel_row["id"]
            hotellux_id = hotel_row["hotellux_id"]

            for attempt in range(3):
                try:
                    async with semaphore:
                        api_response = await hotellux.get_hotel_rates(
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
                        log.error("hotel_day_failed", hotel=hotellux_id,
                                  date=str(check_in), error=str(e))
                        return None, {
                            "type": type(e).__name__,
                            "message": str(e),
                            "context": f"{hotel_row.get('name_en', hotellux_id)}/{check_in}",
                        }
                    await asyncio.sleep(2 ** attempt)

        # 전체 (호텔 × 날짜) 태스크 생성
        all_tasks = []
        for hotel_row in all_hotels:
            for day_offset in range(DETAIL_SCRAPE_DAYS_AHEAD):
                all_tasks.append((hotel_row, day_offset))

        log.info("total_tasks", count=len(all_tasks))

        # 배치 단위로 실행 (메모리 관리)
        BATCH_SIZE = 500
        for batch_start in range(0, len(all_tasks), BATCH_SIZE):
            batch_items = all_tasks[batch_start:batch_start + BATCH_SIZE]

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
                        errors.append({
                            "type": type(res_obj).__name__,
                            "message": str(res_obj),
                            "context": "fatal",
                        })
                    continue

                res, err = res_obj
                if err and len(errors) < 1000:
                    errors.append(err)
                if res:
                    total_room_rates += res.get("room_rates_saved", 0)
                    total_daily_rates += res.get("daily_rates_updated", 0)

            log.info("batch_done", start=batch_start, size=len(batch_items),
                     processed=total_processed)

        # ── 결과 계산 ──
        total_tasks_count = total_processed if total_processed else 1
        success_rate = 1.0 - (len(errors) / total_tasks_count)

        if success_rate < 0.7 or total_room_rates == 0:
            status = "failed"
        elif errors:
            status = "partial"
        else:
            status = "success"

        if status == "failed":
            log.error("ALERT: pipeline failed", run_id=run_id)
        if success_rate < 0.8:
            log.warning("alert", reason="Low success rate", rate=success_rate, errors=len(errors))
        if total_room_rates == 0:
            log.warning("alert", reason="Zero room_rates insertions")

        # ── DB 기록 ──
        try:
            client.table("scrape_logs").update({
                "finished_at": datetime.utcnow().isoformat(),
                "hotels_count": total_hotels_count,
                "rates_inserted": total_room_rates,
                "rates_updated": total_daily_rates,
                "errors": errors[:100],
                "status": status,
            }).eq("run_id", run_id).execute()
        except Exception as db_e:
            log.error("scrape_log_update_failed", error=str(db_e))

        log.info("run_completed", run_id=run_id, status=status,
                 success_rate=round(success_rate, 3),
                 room_rates=total_room_rates, daily_rates=total_daily_rates,
                 errors=len(errors))

        # ── Post-scrape ──
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

    finally:
        await hotellux.close()


if __name__ == "__main__":
    asyncio.run(run())
