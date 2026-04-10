"""
stats_aggregator: 오래된 daily_rates를 monthly_stats로 압축하여 DB 용량 최적화.

- 6개월 이상 지난 daily_rates 데이터를 월별 통계(min/max/avg/count)로 집계
- monthly_stats 테이블에 upsert 후 원본 daily_rates 삭제
- 최근 6개월 데이터는 그대로 유지 (히트맵 캘린더용)
"""

from datetime import UTC, date, datetime

from src.clients.supabase_client import get_client
from src.config import RETENTION_MONTHS
from src.utils.logger import get_logger

log = get_logger("stats_aggregator")

STATS_BATCH_SIZE = 500  # monthly_stats upsert 청크 크기


def get_cutoff_date() -> date:
    """압축 기준 날짜 계산 (오늘 기준 6개월 전 1일)"""
    today = datetime.now(UTC).date()
    month = today.month - RETENTION_MONTHS
    year = today.year
    while month <= 0:
        month += 12
        year -= 1
    return date(year, month, 1)


def compress_old_data() -> dict:
    """
    6개월 이상 된 daily_rates를 monthly_stats로 압축.
    Returns: {"months_processed": int, "rows_deleted": int}
    """
    client = get_client()
    cutoff = get_cutoff_date()
    log.info("compress_started", cutoff=cutoff.isoformat())

    # 1. 압축 대상 데이터 조회 (cutoff 이전)
    res = (
        client.table("daily_rates")
        .select("hotel_id, stay_date, room_type, price_krw, is_sold_out")
        .lt("stay_date", cutoff.isoformat())
        .eq("is_sold_out", False)
        .execute()
    )

    if not res.data:
        log.info("compress_skipped", reason="no old data")
        return {"months_processed": 0, "rows_deleted": 0}

    # 2. 월별 집계
    aggregated: dict[str, dict] = {}  # key = "hotel_id|YYYY-MM-01|room_type"
    for row in res.data:
        stay = row["stay_date"]  # "YYYY-MM-DD"
        month_key = stay[:7] + "-01"  # "YYYY-MM-01"
        key = f"{row['hotel_id']}|{month_key}|{row['room_type']}"

        if key not in aggregated:
            aggregated[key] = {
                "hotel_id": row["hotel_id"],
                "month": month_key,
                "room_type": row["room_type"],
                "prices": [],
            }
        aggregated[key]["prices"].append(row["price_krw"])

    # 3. monthly_stats upsert
    stats_rows = []
    for agg in aggregated.values():
        prices = agg["prices"]
        stats_rows.append(
            {
                "hotel_id": agg["hotel_id"],
                "month": agg["month"],
                "room_type": agg["room_type"],
                "min_price": min(prices),
                "max_price": max(prices),
                "avg_price": round(sum(prices) / len(prices)),
                "sample_count": len(prices),
            }
        )

    if stats_rows:
        # Batch upsert in chunks
        for i in range(0, len(stats_rows), STATS_BATCH_SIZE):
            chunk = stats_rows[i : i + STATS_BATCH_SIZE]
            client.table("monthly_stats").upsert(chunk, on_conflict="hotel_id,month,room_type").execute()
        log.info("stats_upserted", count=len(stats_rows))

    # 4. 원본 daily_rates 삭제 (cutoff 이전)
    del_res = client.table("daily_rates").delete().lt("stay_date", cutoff.isoformat()).execute()

    deleted_count = len(del_res.data) if del_res.data else 0
    log.info("old_rates_deleted", count=deleted_count)

    # 5. 오래된 price_changes도 정리 (cutoff 이전)
    client.table("price_changes").delete().lt("stay_date", cutoff.isoformat()).execute()

    log.info("compress_completed", months_processed=len(stats_rows), rows_deleted=deleted_count)

    return {
        "months_processed": len(stats_rows),
        "rows_deleted": deleted_count,
    }
