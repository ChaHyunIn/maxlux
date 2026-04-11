"""
아고다 가격 스크래핑 클라이언트.
- 호텔의 agoda_id를 사용하여 최저가를 수집합니다.
"""

from src.clients.base_client import BaseClient
from src.config import USER_AGENT
from src.utils.logger import get_logger

log = get_logger("agoda")

AGODA_SEARCH_URL = "https://www.agoda.com/api/cronos/search/SearchResultListV1"

# 아고다 languageId: 9=Korean, 1=English, 11=Chinese(Simplified)
AGODA_LANGUAGE_ID = 9

DEFAULT_HEADERS = {
    "accept": "application/json",
    "accept-language": "ko-KR,ko;q=0.9",
    "content-type": "application/json",
    "origin": "https://www.agoda.com",
    "referer": "https://www.agoda.com/",
    "user-agent": USER_AGENT,
}


class AgodaClient(BaseClient):
    """아고다 가격 수집 클라이언트."""

    def __init__(self):
        super().__init__(name="agoda", headers=DEFAULT_HEADERS)

    async def get_hotel_price(
        self,
        site_id: str,
        check_in: str,
        check_out: str,
    ) -> dict | None:
        """
        아고다에서 특정 호텔의 가격을 조회합니다.
        """
        try:
            client = await self._get_client()

            payload = {
                "hotelId": int(site_id),
                "checkIn": check_in,
                "checkOut": check_out,
                "rooms": 1,
                "adults": 2,
                "children": 0,
                "childAges": [],
                "currency": "KRW",
                "languageId": AGODA_LANGUAGE_ID,
                "los": 1,
            }

            resp = await client.post(AGODA_SEARCH_URL, json=payload)

            if resp.status_code == 403:
                self.log.warning("agoda_blocked", site_id=site_id)
                return None

            if resp.status_code != 200:
                self.log.warning("agoda_http_error", site_id=site_id, status=resp.status_code)
                return None

            data = resp.json()
            price = self._extract_price(data)
            if price is None:
                return None

            url = f"https://www.agoda.com/ko-kr/hotel/{site_id}.html?checkIn={check_in}&checkOut={check_out}"

            return {
                "price_krw": price["amount"],
                "room_type": price.get("room_type", "standard"),
                "url": url,
            }

        except Exception as e:
            self.log.error("agoda_error", site_id=site_id, error=str(e))
            return None

    def _extract_price(self, data: dict) -> dict | None:
        """API 응답에서 최저가를 추출합니다."""
        try:
            results = data.get("results", [])
            if not results:
                return None

            result = results[0] if isinstance(results, list) else results
            price_info = result.get("pricing", result.get("price", {}))

            amount = price_info.get("displayPrice", price_info.get("price"))
            if amount is None:
                return None

            return {
                "amount": int(float(amount)),
                "room_type": result.get("roomName", "standard"),
            }
        except (KeyError, TypeError, ValueError):
            return None
