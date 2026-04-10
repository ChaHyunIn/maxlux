from datetime import UTC, date, datetime

from src.clients.supabase_client import get_client
from src.services.cdc import log_price_change
from src.services.rate_parser import parse_rooms_to_rows
from src.services.tagger import tag_date
from src.utils.logger import get_logger

log = get_logger("rate_collector")


# Orchestrator
def save_rates_from_search(hotels_data: list[dict], check_in: str, holidays: set[date]) -> dict:
    stay = date.fromisoformat(check_in)
    tag = tag_date(stay, holidays)

    # Pre-parse results
    parsed_rates = []
    for h in hotels_data:
        hotellux_id = h.get("_id")
        price_detail = h.get("minBasePriceDetail", {}) or {}
        price_krw = price_detail.get("amount")
        is_sold_out = False

        if not hotellux_id:
            continue

        # Treat None or 0 as sold out rather than skipping
        if price_krw is None or price_krw == 0:
            is_sold_out = True
            price_krw = 0
        elif not isinstance(price_krw, (int, float)):
            continue

        parsed_rates.append(
            {
                "hotellux_id": hotellux_id,
                "price_krw": int(price_krw),
                "stay_date": check_in,
                "room_type": "nr_nobf",
                "tag": tag,
                "is_sold_out": is_sold_out,
            }
        )

    if not parsed_rates:
        return {"inserted": 0, "updated": 0, "skipped": 0}

    client = get_client()

    # Pre-load hotellux_id -> uuid mappings once
    hotellux_ids = [r["hotellux_id"] for r in parsed_rates]
    hotels_res = client.table("hotels").select("id, hotellux_id").in_("hotellux_id", hotellux_ids).execute()
    hotel_map = {row["hotellux_id"]: row["id"] for row in hotels_res.data} if hotels_res.data else {}

    # Gather rows to insert/update
    valid_rates = []
    for rate in parsed_rates:
        hotel_uuid = hotel_map.get(rate["hotellux_id"])
        if hotel_uuid:
            valid_rates.append(
                {
                    "hotel_id": hotel_uuid,
                    "stay_date": rate["stay_date"],
                    "price_krw": rate["price_krw"],
                    "room_type": rate["room_type"],
                    "tag": rate["tag"],
                    "is_sold_out": rate["is_sold_out"],
                }
            )
        else:
            log.warning("hotel_mapping_missing", hotellux_id=rate["hotellux_id"])

    if not valid_rates:
        return {"inserted": 0, "updated": 0, "skipped": len(parsed_rates)}

    # Pre-load existing prices for CDC diffing
    hotel_ids = [r["hotel_id"] for r in valid_rates]
    existing_res = (
        client.table("daily_rates")
        .select("hotel_id, room_type, price_krw")
        .eq("stay_date", check_in)
        .in_("hotel_id", hotel_ids)
        .execute()
    )
    existing_price_map = (
        {f"{row['hotel_id']}_{row.get('room_type', 'non_refundable')}": row["price_krw"] for row in existing_res.data}
        if existing_res.data
        else {}
    )

    inserted, updated, skipped = 0, 0, len(parsed_rates) - len(valid_rates)

    # Execute batch upsert
    upsert_res = client.table("daily_rates").upsert(valid_rates, on_conflict="hotel_id,stay_date,room_type").execute()

    if upsert_res is None or hasattr(upsert_res, "error"):
        raise Exception("DB upsert failed")

    # Log CDC
    for rate in valid_rates:
        hotel_uuid = rate["hotel_id"]
        key = f"{hotel_uuid}_{rate['room_type']}"
        old_price = existing_price_map.get(key)
        new_price = rate["price_krw"]
        # Skip saving identical prices to CDC logically, but keep logging
        log_price_change(hotel_uuid, rate["stay_date"], rate["room_type"], old_price, new_price)

        if old_price is None:
            inserted += 1
        elif old_price != new_price:
            updated += 1
        else:
            # same price, effectively skipped in terms of meaningful update
            pass

    if not isinstance(inserted, int):
        inserted = 0
    if not isinstance(updated, int):
        updated = 0

    hotel_ids_to_update = list(set(r["hotel_id"] for r in valid_rates))
    if hotel_ids_to_update:
        try:
            client.table("hotels").update({"latest_scraped_at": datetime.now(UTC).isoformat()}).in_(
                "id", hotel_ids_to_update
            ).execute()
        except Exception as e:
            log.warning("latest_scraped_at_update_failed", error=str(e))

    log.info("rates_saved", date=check_in, tag=tag, inserted=inserted, updated=updated, skipped=skipped)
    return {"inserted": inserted, "updated": updated, "skipped": skipped}


def save_room_rates(hotel_uuid: str, check_in: str, api_response: dict, holidays: set[date]) -> dict:
    """
    호텔 상세 요금 API 응답을 room_rates 테이블에 저장하고,
    daily_rates에 집계 최저가를 업데이트합니다.

    Args:
        hotel_uuid: DB상의 호텔 UUID
        check_in: ISO date string
        api_response: get_hotel_rates()의 반환값
        holidays: 공휴일 date set

    Returns:
        {"room_rates_saved": int, "daily_rates_updated": int}
    """
    rows = parse_rooms_to_rows(api_response, hotel_uuid, check_in)

    if not rows:
        return {"room_rates_saved": 0, "daily_rates_updated": 0}

    client = get_client()

    # 1. room_rates에 upsert
    try:
        client.table("room_rates").upsert(rows, on_conflict="hotel_id,stay_date,source,room_id,rate_code").execute()
    except Exception as e:
        log.error("room_rates_upsert_failed", hotel=hotel_uuid[:8], date=check_in, error=str(e))
        raise

    # 2. daily_rates 집계 업데이트
    #    room_rates에서 4가지 버킷 최저가를 계산하여 daily_rates에 반영
    stay = date.fromisoformat(check_in)
    tag = tag_date(stay, holidays)
    daily_rows = _aggregate_to_daily(hotel_uuid, check_in, rows, tag)

    if daily_rows:
        try:
            client.table("daily_rates").upsert(daily_rows, on_conflict="hotel_id,stay_date,room_type").execute()
        except Exception as e:
            log.error("daily_aggregate_failed", hotel=hotel_uuid[:8], date=check_in, error=str(e))

    # 3. latest_scraped_at 업데이트
    try:
        client.table("hotels").update({"latest_scraped_at": datetime.now(UTC).isoformat()}).eq(
            "id", hotel_uuid
        ).execute()
    except Exception as e:
        log.warning("latest_scraped_at_failed", error=str(e))

    log.info("room_rates_saved", hotel=hotel_uuid[:8], date=check_in, room_rates=len(rows), daily_rates=len(daily_rows))

    return {"room_rates_saved": len(rows), "daily_rates_updated": len(daily_rows)}


def _aggregate_to_daily(hotel_uuid: str, check_in: str, room_rate_rows: list[dict], tag: str) -> list[dict]:
    """
    room_rates 행 리스트에서 4개 버킷 최저가를 계산하여 daily_rates 행으로 변환합니다.

    버킷 (room_type 값):
    - "nr_nobf" : 취소불가 + 조식불포함 (가장 순수한 최저가)
    - "nr_bf"   : 취소불가 + 조식포함
    - "r_nobf"  : 취소가능 + 조식불포함
    - "r_bf"    : 취소가능 + 조식포함
    """
    buckets = {
        "nr_nobf": None,  # not refundable, no breakfast
        "nr_bf": None,  # not refundable, with breakfast
        "r_nobf": None,  # refundable, no breakfast
        "r_bf": None,  # refundable, with breakfast
    }

    for row in room_rate_rows:
        is_ref = row["is_refundable"]
        has_bf = row["has_breakfast"]
        price = row["price_krw"]

        if is_ref and has_bf:
            key = "r_bf"
        elif is_ref and not has_bf:
            key = "r_nobf"
        elif not is_ref and has_bf:
            key = "nr_bf"
        else:
            key = "nr_nobf"

        if buckets[key] is None or price < buckets[key]:
            buckets[key] = price

    daily_rows = []
    for room_type, min_price in buckets.items():
        if min_price is not None:
            daily_rows.append(
                {
                    "hotel_id": hotel_uuid,
                    "stay_date": check_in,
                    "price_krw": min_price,
                    "room_type": room_type,
                    "tag": tag,
                    "is_sold_out": False,
                }
            )

    return daily_rows
