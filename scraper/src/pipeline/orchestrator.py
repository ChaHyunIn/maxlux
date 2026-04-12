import contextlib
import uuid
from datetime import UTC, datetime

from src.clients.hotellux import HotelLuxClient
from src.clients.supabase_client import get_client
from src.config import CITIES, DETAIL_SCRAPE_DAYS_AHEAD
from src.pipeline.hotel_sync_phase import run_hotel_sync
from src.pipeline.post_scrape_phase import run_post_scrape
from src.pipeline.rate_collection_phase import run_rate_collection
from src.services.exchange_rate_sync import sync_exchange_rate
from src.utils.holidays import load_holidays, seed_holidays_auto
from src.utils.logger import get_logger

log = get_logger("orchestrator")


async def run_pipeline():
    run_id = str(uuid.uuid4())[:8]
    started_at = datetime.now(UTC).isoformat()
    client = get_client()
    hotellux = HotelLuxClient()

    try:
        log.info("run_started", run_id=run_id, cities=CITIES, days=DETAIL_SCRAPE_DAYS_AHEAD)
        client.table("scrape_logs").insert(
            {
                "run_id": run_id,
                "started_at": started_at,
                "status": "running",
            }
        ).execute()

        # ── Holiday 시드 및 로드 ──
        current_year = datetime.now(UTC).date().year
        await seed_holidays_auto(client, current_year)
        if datetime.now(UTC).date().month >= 10:
            await seed_holidays_auto(client, current_year + 1)
        holidays = load_holidays(client)

        errors = []

        # ── Phase A: 호텔 리스트 동기화 (도시별 1회씩) ──
        total_hotels_count = await run_hotel_sync(hotellux, errors)

        # ── Phase B: 호텔별 상세 요금 수집 ──
        total_room_rates, total_daily_rates, total_processed = await run_rate_collection(
            client, hotellux, holidays, errors
        )

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
            client.table("scrape_logs").update(
                {
                    "finished_at": datetime.now(UTC).isoformat(),
                    "hotels_count": total_hotels_count,
                    "rates_inserted": total_room_rates,
                    "rates_updated": total_daily_rates,
                    # TODO: DB 용량 제한으로 인해 에러는 최근 100건만 유지.
                    "errors": errors[:100],
                    "status": status,
                }
            ).eq("run_id", run_id).execute()
        except Exception as db_e:
            log.error("scrape_log_update_failed", error=str(db_e))

        log.info(
            "run_completed",
            run_id=run_id,
            status=status,
            success_rate=round(success_rate, 3),
            room_rates=total_room_rates,
            daily_rates=total_daily_rates,
            errors=len(errors),
        )

        # ── Post-scrape ──
        post_result = await run_post_scrape()
        errors.extend(post_result.get("post_scrape_errors", []))

        # ── Post-scrape 결과 추가 기록 ──
        if post_result.get("post_scrape_errors"):
            with contextlib.suppress(Exception):
                client.table("scrape_logs").update(
                    {"errors": errors[:100]}
                ).eq("run_id", run_id).execute()

        # ── Materialized View 갱신 ──
        try:
            log.info("refreshing_materialized_view", view="hotels_with_min_price")
            client.rpc("refresh_hotels_with_min_price").execute()
            log.info("materialized_view_refreshed", view="hotels_with_min_price")
        except Exception as mv_err:
            log.error("materialized_view_refresh_failed", error=str(mv_err))
            errors.append({"phase": "mv_refresh", "error": str(mv_err)})

        # ── 환율 동기화 (Phase C) ──
        await sync_exchange_rate()

    finally:
        await hotellux.close()
