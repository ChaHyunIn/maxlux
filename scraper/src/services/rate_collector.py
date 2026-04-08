from datetime import date
from src.clients.supabase_client import get_client
from src.services.tagger import tag_date, load_holidays
from src.services.cdc import log_price_change
from src.utils.logger import get_logger

log = get_logger("rate_collector")

# DB Repository Methods
def get_hotel_uuid(hotellux_id: str) -> str | None:
    client = get_client()
    result = (client.table("hotels").select("id")
              .eq("hotellux_id", hotellux_id).limit(1).execute())
    return result.data[0]["id"] if result.data else None

def get_existing_price(hotel_uuid: str, stay_date: str) -> int | None:
    client = get_client()
    result = (client.table("daily_rates").select("price_krw")
              .eq("hotel_id", hotel_uuid).eq("stay_date", stay_date)
              .eq("room_type", "standard").limit(1).execute())
    return result.data[0]["price_krw"] if result.data else None

# Data Transformer
def parse_search_rates(hotels_data: list[dict], check_in: str, tag: str) -> list[dict]:
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
    return parsed_rates

# Orchestrator
def save_rates_from_search(hotels_data: list[dict], check_in: str) -> dict:
    stay = date.fromisoformat(check_in)
    tag = tag_date(stay, load_holidays())
    
    parsed_rates = parse_search_rates(hotels_data, check_in, tag)
    
    client = get_client()
    inserted, updated, skipped = 0, 0, 0

    for rate in parsed_rates:
        hotel_uuid = get_hotel_uuid(rate["hotellux_id"])
        if not hotel_uuid:
            skipped += 1
            continue

        old_price = get_existing_price(hotel_uuid, rate["stay_date"])
        log_price_change(hotel_uuid, rate["stay_date"], rate["room_type"], old_price, rate["price_krw"])

        row = {
            "hotel_id": hotel_uuid,
            "stay_date": rate["stay_date"],
            "price_krw": rate["price_krw"],
            "room_type": rate["room_type"],
            "tag": rate["tag"],
            "is_sold_out": rate["is_sold_out"]
        }
        client.table("daily_rates").upsert(
            row, on_conflict="hotel_id,stay_date,room_type").execute()

        if old_price is None:
            inserted += 1
        else:
            updated += 1

    log.info("rates_saved", date=check_in, tag=tag,
             inserted=inserted, updated=updated, skipped=skipped)
    return {"inserted": inserted, "updated": updated, "skipped": skipped}
