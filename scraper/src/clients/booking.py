"""
부킹닷컴 가격 스크래핑 클라이언트.

부킹닷컴 GraphQL API를 이용하여 호텔 가격을 수집합니다.
- 호텔의 booking_id가 있어야 검색 가능
- rate limit을 준수하기 위해 delay 적용
"""

import asyncio

import httpx

from src.utils.logger import get_logger

log = get_logger("booking")

BOOKING_GRAPHQL_URL = "https://www.booking.com/dml/graphql"

DEFAULT_HEADERS = {
    "accept": "application/json",
    "accept-language": "ko-KR,ko;q=0.9",
    "content-type": "application/json",
    "origin": "https://www.booking.com",
    "referer": "https://www.booking.com/",
    "user-agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/146.0.0.0 Safari/537.36"
    ),
}

REQUEST_DELAY = 3.0


class BookingClient:
    """부킹닷컴 가격 수집 클라이언트."""

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
        booking_id: str,
        check_in: str,
        check_out: str,
    ) -> dict | None:
        """
        부킹닷컴에서 특정 호텔의 가격을 조회합니다.

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

            # Booking.com search API
            url = "https://www.booking.com/searchresults.ko.html"
            params = {
                "dest_id": booking_id,
                "dest_type": "hotel",
                "checkin": check_in,
                "checkout": check_out,
                "group_adults": "2",
                "no_rooms": "1",
                "selected_currency": "KRW",
            }

            resp = await client.get(url, params=params)

            if resp.status_code == 403:
                log.warning("booking_blocked", booking_id=booking_id)
                return None

            if resp.status_code != 200:
                log.warning("booking_http_error", booking_id=booking_id, status=resp.status_code)
                return None

            # Parse price from HTML/JSON response
            price = self._extract_price_from_response(resp.text, booking_id)
            if price is None:
                return None

            booking_url = (
                f"https://www.booking.com/hotel/kr/{booking_id}.ko.html?checkin={check_in}&checkout={check_out}"
            )

            return {
                "price_krw": price["amount"],
                "room_type": price.get("room_type", "standard"),
                "url": booking_url,
            }

        except Exception as e:
            log.error("booking_error", booking_id=booking_id, error=str(e))
            return None

    def _extract_price_from_response(self, html: str, booking_id: str) -> dict | None:
        """응답에서 최저가를 추출합니다."""
        import json
        import re

        try:
            # Try to find JSON-LD structured data
            ld_pattern = r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'
            matches = re.findall(ld_pattern, html, re.DOTALL)

            for match in matches:
                try:
                    ld_data = json.loads(match)
                    if isinstance(ld_data, dict):
                        offers = ld_data.get("offers", {})
                        price = offers.get("lowPrice") or offers.get("price")
                        if price:
                            return {
                                "amount": int(float(price)),
                                "room_type": "standard",
                            }
                except json.JSONDecodeError:
                    continue

            # Fallback: look for price pattern in HTML
            price_pattern = r'data-price["\s=:]+["\']?(\d[\d,]+)'
            price_match = re.search(price_pattern, html)
            if price_match:
                price_str = price_match.group(1).replace(",", "")
                return {
                    "amount": int(price_str),
                    "room_type": "standard",
                }

            return None

        except Exception:
            return None

    async def get_prices_for_hotels(
        self,
        hotels: list[dict],
        check_in: str,
        check_out: str,
        semaphore: asyncio.Semaphore | None = None,
    ) -> list[dict]:
        """
        여러 호텔의 부킹닷컴 가격을 수집합니다.

        Args:
            hotels: [{"hotel_id": uuid, "booking_id": str}, ...]
            check_in: "YYYY-MM-DD"
            check_out: "YYYY-MM-DD"

        Returns:
            [{"hotel_id": uuid, "price_krw": int, "room_type": str, "url": str}, ...]
        """
        if semaphore is None:
            semaphore = asyncio.Semaphore(3)

        results = []

        for hotel in hotels:
            booking_id = hotel.get("booking_id")
            if not booking_id:
                continue

            async with semaphore:
                price_data = await self.get_hotel_price(booking_id, check_in, check_out)

            if price_data:
                results.append(
                    {
                        "hotel_id": hotel["hotel_id"],
                        "stay_date": check_in,
                        "source": "booking",
                        "price_krw": price_data["price_krw"],
                        "room_type": price_data["room_type"],
                        "url": price_data["url"],
                    }
                )

            await asyncio.sleep(REQUEST_DELAY)

        log.info("booking_batch_done", date=check_in, found=len(results), total=len(hotels))
        return results
