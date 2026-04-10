"""
HotelLux /hotel/rates API 응답을 파싱하여 room_rates 테이블 행으로 변환합니다.

API 응답 구조:
  rooms[] → 각 room (객실 타입)
    ├─ _id, name, nameEn, images[], attributes{bed, bedType, view, size, capacity}
    └─ rates[] → 각 rate plan
         ├─ code, name, nameEn
         ├─ price (KRW 총액, 세금 포함)
         ├─ priceDetail.aggregated.sumReservationBase (세전 기본가)
         ├─ priceDetail.aggregated.approximateUsd.average (USD)
         ├─ priceDetail.aggregated.approximateCny.average (CNY)
         ├─ priceDetail.aggregated.approximateJpy.average (JPY)
         ├─ priceDetail.breakdown[] → [{type:"base", amount}, {type:"tax", amount}]
         ├─ cancellation.cancelable (bool)
         ├─ cancellation.deadline (str)
         ├─ breakfast.include (bool)
         └─ benefit{code, type, description, tags[], name}
"""

import re

from src.utils.logger import get_logger

log = get_logger("rate_parser")


def has_chinese(text):
    return bool(re.search(r"[\u4e00-\u9fa5]", text or ""))


def parse_rooms_to_rows(api_response: dict, hotel_uuid: str, stay_date: str, source: str = "hotellux") -> list[dict]:
    """
    API 응답을 room_rates 테이블에 삽입할 행 리스트로 변환합니다.

    Args:
        api_response: get_hotel_rates()의 반환값
        hotel_uuid: DB상의 호텔 UUID
        stay_date: ISO date string (체크인 날짜)
        source: 데이터 소스 (기본값 "hotellux")

    Returns:
        list[dict] — 각 dict는 room_rates 테이블의 1행
    """
    rooms = api_response.get("rooms", [])
    rows = []

    for room in rooms:
        room_id = room.get("_id", "")
        room_name = room.get("name", "")
        raw_room_name_en = room.get("nameEn") or room.get("name_en")
        room_name_en = raw_room_name_en if raw_room_name_en and not has_chinese(raw_room_name_en) else None
        images = room.get("images", [])
        room_img = images[0] if images else None

        attrs = room.get("attributes", {})
        bed_type = attrs.get("bedType")  # "one", "two"
        room_size = attrs.get("size")  # 36
        room_capacity = attrs.get("capacity")  # 2
        room_view = attrs.get("view")  # "城市景观"

        for rate in room.get("rates", []):
            price_krw = rate.get("price")
            if not price_krw or price_krw <= 0:
                continue

            price_krw = int(price_krw)

            # 세전 기본가 / 세금
            agg = rate.get("priceDetail", {}).get("aggregated", {})
            price_base_krw = agg.get("sumReservationBase")
            if price_base_krw is not None:
                price_base_krw = int(price_base_krw)
            price_tax_krw = price_krw - price_base_krw if price_base_krw else None

            # 다통화 가격 (API 원본 그대로 저장)
            usd_data = agg.get("approximateUsd", {})
            cny_data = agg.get("approximateCny", {})
            jpy_data = agg.get("approximateJpy", {})

            price_usd = usd_data.get("average")
            price_cny = cny_data.get("average")
            price_jpy = jpy_data.get("average")

            # 환율 (API가 제공하는 값 그대로)
            pd = rate.get("priceDetail", {})
            exchange_usd = pd.get("approximateUsd", {}).get("exchangeRate")
            exchange_cny = pd.get("approximateCny", {}).get("exchangeRate")
            exchange_jpy = pd.get("approximateJpy", {}).get("exchangeRate")

            # 취소 정책
            cancel_info = rate.get("cancellation", {})
            is_refundable = cancel_info.get("cancelable", False)
            cancel_deadline = cancel_info.get("deadline")  # "2026-04-09 18:00:00"

            # 조식
            has_breakfast = rate.get("breakfast", {}).get("include", False)

            # 혜택
            benefit = rate.get("benefit", {})
            benefit_code = benefit.get("code")  # "CHARM", "V8M", "API"
            benefit_type = benefit.get("type")  # "luxury", "virtuoso"
            benefit_tags = benefit.get("tags", [])  # ["赠送早餐","100USD餐饮消费抵扣",...]
            benefit_desc = benefit.get("description")  # 전체 설명 텍스트

            raw_rate_name_en = rate.get("nameEn") or rate.get("name_en")
            rate_name_en = raw_rate_name_en if raw_rate_name_en and not has_chinese(raw_rate_name_en) else None

            row = {
                "hotel_id": hotel_uuid,
                "stay_date": stay_date,
                "source": source,
                "room_id": room_id,
                "room_name": room_name,
                "room_name_en": room_name_en,
                "room_img": room_img,
                "bed_type": bed_type,
                "room_size": room_size,
                "room_capacity": room_capacity,
                "room_view": room_view,
                "rate_code": rate.get("code", ""),
                "rate_name": rate.get("name", ""),
                "rate_name_en": rate_name_en,
                "price_krw": price_krw,
                "price_base_krw": price_base_krw,
                "price_tax_krw": price_tax_krw,
                "price_usd": round(price_usd, 2) if price_usd else None,
                "price_cny": round(price_cny, 2) if price_cny else None,
                "price_jpy": int(price_jpy) if price_jpy else None,
                "exchange_rate_usd": exchange_usd,
                "exchange_rate_cny": exchange_cny,
                "exchange_rate_jpy": exchange_jpy,
                "is_refundable": is_refundable,
                "cancel_deadline": cancel_deadline,
                "has_breakfast": has_breakfast,
                "benefit_code": benefit_code,
                "benefit_type": benefit_type,
                "benefit_tags": benefit_tags,
                "benefit_desc": benefit_desc,
                "is_sold_out": False,
            }
            rows.append(row)

    log.info("rates_parsed", hotel=hotel_uuid[:8], date=stay_date, rows=len(rows))
    return rows
