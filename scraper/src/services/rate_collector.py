from datetime import date
from src.clients.supabase_client import get_client
from src.services.tagger import tag_date
from src.services.cdc import log_price_change
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
        price_detail = h.get("minBasePriceDetail", {})
        price_krw = price_detail.get("amount")
        if hotellux_id and price_krw:
            parsed_rates.append({
                "hotellux_id": hotellux_id,
                "price_krw": price_krw,
                "stay_date": check_in,
                "room_type": "standard",
                "tag": tag,
                "is_sold_out": False
            })

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
            valid_rates.append({
                "hotel_id": hotel_uuid,
                "stay_date": rate["stay_date"],
                "price_krw": rate["price_krw"],
                "room_type": rate["room_type"],
                "tag": rate["tag"],
                "is_sold_out": rate["is_sold_out"]
            })

    if not valid_rates:
        return {"inserted": 0, "updated": 0, "skipped": len(parsed_rates)}

    # Pre-load existing prices for CDC diffing
    hotel_ids = [r["hotel_id"] for r in valid_rates]
    existing_res = client.table("daily_rates").select("hotel_id, price_krw").eq("stay_date", check_in).eq("room_type", "standard").in_("hotel_id", hotel_ids).execute()
    existing_price_map = {row["hotel_id"]: row["price_krw"] for row in existing_res.data} if existing_res.data else {}

    inserted, updated, skipped = 0, 0, len(parsed_rates) - len(valid_rates)
    
    # Execute batch upsert
    upsert_res = client.table("daily_rates").upsert(
        valid_rates, on_conflict="hotel_id,stay_date,room_type"
    ).execute()
    
    # Log CDC
    for rate in valid_rates:
        hotel_uuid = rate["hotel_id"]
        old_price = existing_price_map.get(hotel_uuid)
        new_price = rate["price_krw"]
        # Skip saving identical prices to CDC logically, but keep logging
        log_price_change(hotel_uuid, rate["stay_date"], rate["room_type"], old_price, new_price)

        if old_price is None:
            inserted += 1
        else:
            updated += 1
            
    # Fallback to len matching if upsert res isn't directly usable
    if not isinstance(inserted, int): inserted = 0
    if not isinstance(updated, int): updated = 0

    log.info("rates_saved", date=check_in, tag=tag,
             inserted=inserted, updated=updated, skipped=skipped)
    return {"inserted": inserted, "updated": updated, "skipped": skipped}
