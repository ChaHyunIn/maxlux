from src.clients.supabase_client import get_client
from src.config import BENEFIT_VALUE_BREAKFAST_FOR_2, BENEFIT_VALUE_CREDIT_100USD
from src.data.mappings import BRAND_MAPPING, HOTEL_KO_MAPPING, get_city
from src.utils.logger import get_logger

log = get_logger("hotel_sync")


def slugify(name: str, city: str = "") -> str:
    base = name.lower()
    # 이미 city가 name에 포함되어 있으면 그대로, 아니면 접미사 추가
    if city and city.lower() not in base:
        base = f"{base}-{city.lower()}"
    return (
        base.replace(",", "")
        .replace(".", "")
        .replace("'", "")
        .replace("&", "and")
        .replace("  ", " ")
        .replace(" ", "-")
        .strip("-")
    )


def estimate_benefit_value(benefits: list[dict]) -> int:
    value = 0
    for b in benefits:
        desc = str(b.get("description", "")) + " " + " ".join(b.get("tags", []))
        if "100USD" in desc or "100美元" in desc:
            value += BENEFIT_VALUE_CREDIT_100USD
        if "赠送早餐" in desc or "双早" in desc:
            value += BENEFIT_VALUE_BREAKFAST_FOR_2
    return value


def sync_hotels(hotels_data: list[dict]) -> int:
    client = get_client()

    # DB에서 기존 호텔 정보를 미리 조회하여 캐싱 (name_ko 유지 목적)
    try:
        existing_res = client.table("hotels").select("hotellux_id, name_ko").execute()
        existing_map = {row["hotellux_id"]: row["name_ko"] for row in existing_res.data}
    except Exception:
        log.warning("failed_to_fetch_existing_hotels", msg="Proceeding without DB cache")
        existing_map = {}

    rows = []
    for h in hotels_data:
        hotel_id = h.get("_id")
        if not hotel_id:
            continue

        name_en = h.get("nameEn", h.get("name", "")).strip()

        # 1. DB에 이미 있는 호텔이면 기존 name_ko 유지
        # 2. 없으면 HOTEL_KO_MAPPING 확인
        # 3. 그외에는 영문명 사용
        name_ko = existing_map.get(hotel_id) or HOTEL_KO_MAPPING.get(name_en, name_en)

        city_obj = h.get("city", {})
        location = h.get("location", {})
        brand_obj = h.get("brand", {})

        raw_city = city_obj.get("name", "unknown")
        city_val = get_city(raw_city)

        raw_brand = brand_obj.get("name")
        brand_val = BRAND_MAPPING.get(raw_brand)
        if not brand_val and raw_brand:
            # Fallback text matching
            for kor_brand in BRAND_MAPPING.values():
                if kor_brand in name_ko:
                    brand_val = kor_brand
                    break
        if not brand_val:
            brand_val = raw_brand

        benefits_list = h.get("benefits", [])

        rows.append(
            {
                "hotellux_id": hotel_id,
                "hotellux_code": h.get("code"),
                "name_ko": name_ko,
                "name_en": name_en,
                "slug": slugify(name_en, city_val),
                "city": city_val,
                "brand": brand_val,
                "image_url": h.get("images", [None])[0],
                "address": h.get("address"),
                "latitude": location.get("latitude"),
                "longitude": location.get("longitude"),
                "benefits": benefits_list,
                "benefit_value_krw": estimate_benefit_value(benefits_list),
                "description": h.get("description"),
                "booking_url": (
                    h.get("bookingUrl")
                    or h.get("deeplink")
                    or h.get("url")
                    or f"https://hotel.hotelux.com/hotel/{hotel_id}"
                    # NOTE: HOTELLUX_BASE_URL은 API URL이므로 사용자 향 URL과 다름.
                    # 사용자 향 기본 URL 패턴은 https://hotel.hotelux.com/hotel/{id} 유지.
                ),
                "is_active": True,
            }
        )

    # Batch upsert in chunks of 50 to stay within Supabase request limits
    batch_size = 50
    upserted = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        client.table("hotels").upsert(batch, on_conflict="hotellux_id").execute()
        upserted += len(batch)
        log.info("hotel_batch_upserted", batch_start=i, count=len(batch))

    log.info("hotels_synced", count=upserted)
    return upserted
