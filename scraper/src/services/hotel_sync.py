from src.clients.supabase_client import get_client
from src.data.mappings import HOTEL_KO_MAPPING, BRAND_MAPPING, get_city
from src.utils.logger import get_logger

log = get_logger("hotel_sync")

def slugify(name: str) -> str:
    return (name.lower().replace(",", "").replace(".", "").replace("'", "")
            .replace("&", "and").replace("  ", " ").replace(" ", "-").strip("-"))

def sync_hotels(hotels_data: list[dict]) -> int:
    client = get_client()
    upserted = 0
    for h in hotels_data:
        hotel_id = h.get("_id")
        if not hotel_id:
            continue
        name_en = h.get("nameEn", h.get("name", "")).strip()
        name_ko = HOTEL_KO_MAPPING.get(name_en, name_en)
        city_obj = h.get("city", {})
        location = h.get("location", {})
        brand_obj = h.get("brand", {})

        raw_city = city_obj.get("name", "unknown")
        city_val = get_city(raw_city)

        raw_brand = brand_obj.get("name")
        brand_val = BRAND_MAPPING.get(raw_brand, raw_brand)

        row = {
            "hotellux_id": hotel_id,
            "hotellux_code": h.get("code"),
            "name_ko": name_ko,
            "name_en": name_en,
            "slug": slugify(name_en),
            "city": city_val,
            "brand": brand_val,
            "image_url": h.get("images", [None])[0],
            "address": h.get("address"),
            "latitude": location.get("latitude"),
            "longitude": location.get("longitude"),
            "benefits": h.get("benefits", []),
            "description": h.get("description"),
            "is_active": True,
        }
        client.table("hotels").upsert(row, on_conflict="hotellux_id").execute()
        upserted += 1
    log.info("hotels_synced", count=upserted)
    return upserted
