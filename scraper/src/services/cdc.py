from src.clients.supabase_client import get_client
from src.utils.logger import get_logger

log = get_logger("cdc")

def log_price_change(hotel_id: str, stay_date: str, room_type: str,
                     old_price: int | None, new_price: int):
    if old_price is None or old_price == new_price:
        return
    client = get_client()
    client.table("price_changes").insert({
        "hotel_id": hotel_id, "stay_date": stay_date,
        "room_type": room_type, "source": "hotellux",
        "old_price": old_price, "new_price": new_price,
    }).execute()
    log.info("price_changed", hotel_id=hotel_id[:8], date=stay_date,
             old=old_price, new=new_price)
