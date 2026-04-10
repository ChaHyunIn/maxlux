"""
아고다 가격 스크래핑 클라이언트.

아고다 검색 API를 이용하여 호텔 가격을 수집합니다.
- 호텔의 agoda_id가 있어야 검색 가능
- rate limit을 준수하기 위해 delay 적용
"""

import asyncio

import httpx

from src.config import USER_AGENT
from src.utils.logger import get_logger

log = get_logger("agoda")

AGODA_SEARCH_URL = "https://www.agoda.com/api/cronos/search/SearchResultListV1"
AGODA_HOTEL_URL = "https://www.agoda.com/api/cronos/property/BelowFoldParams/GetSecondaryData"

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

REQUEST_DELAY = 3.0  # seconds between requests


class AgodaClient:
    """아고다 가격 수집 클라이언트."""

    def __init__(self):
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30,
                headers=DEFAULT_HEADERS,
                follow_redirects=True,
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def get_hotel_price(
        self,
        agoda_id: str,
        check_in: str,
        check_out: str,
    ) -> dict | None:
        """
        아고다에서 특정 호텔의 가격을 조회합니다.

        Returns:
            {
                "price_krw": int,
                "room_type": str,
                "url": str,
            }
            or None if not available
        """
        try:
            client = await self._get_client()

            # 아고다 검색 API 호출
            payload = {
                "hotelId": int(agoda_id),
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
                log.warning("agoda_blocked", agoda_id=agoda_id)
                return None

            if resp.status_code != 200:
                log.warning("agoda_http_error", agoda_id=agoda_id, status=resp.status_code)
                return None

            data = resp.json()

            # 가격 추출
            price = self._extract_price(data)
            if price is None:
                return None

            url = f"https://www.agoda.com/ko-kr/hotel/{agoda_id}.html?checkIn={check_in}&checkOut={check_out}"

            return {
                "price_krw": price["amount"],
                "room_type": price.get("room_type", "standard"),
                "url": url,
            }

        except Exception as e:
            log.error("agoda_error", agoda_id=agoda_id, error=str(e))
            return None

    def _extract_price(self, data: dict) -> dict | None:
        """API 응답에서 최저가를 추출합니다."""
        try:
            # 응답 구조는 API 변경에 따라 달라질 수 있음
            results = data.get("results", [])
            if not results:
                return None

            # 첫 번째 결과에서 가격 추출
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

    async def get_prices_for_hotels(
        self,
        hotels: list[dict],
        check_in: str,
        check_out: str,
        semaphore: asyncio.Semaphore | None = None,
    ) -> list[dict]:
        """
        여러 호텔의 아고다 가격을 수집합니다.

        Args:
            hotels: [{"hotel_id": uuid, "agoda_id": str}, ...]
            check_in: "YYYY-MM-DD"
            check_out: "YYYY-MM-DD"

        Returns:
            [{"hotel_id": uuid, "price_krw": int, "room_type": str, "url": str}, ...]
        """
        if semaphore is None:
            semaphore = asyncio.Semaphore(3)

        results = []

        for hotel in hotels:
            agoda_id = hotel.get("agoda_id")
            if not agoda_id:
                continue

            async with semaphore:
                price_data = await self.get_hotel_price(agoda_id, check_in, check_out)

            if price_data:
                results.append(
                    {
                        "hotel_id": hotel["hotel_id"],
                        "stay_date": check_in,
                        "source": "agoda",
                        "price_krw": price_data["price_krw"],
                        "room_type": price_data["room_type"],
                        "url": price_data["url"],
                    }
                )

            await asyncio.sleep(REQUEST_DELAY)

        log.info("agoda_batch_done", date=check_in, found=len(results), total=len(hotels))
        return results
