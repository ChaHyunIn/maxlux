"""
부킹닷컴 가격 스크래핑 클라이언트.
- 부킹닷컴 검색결과 페이지에서 가격을 추출합니다.
"""

import json
import re

from src.clients.base_client import BaseClient
from src.config import USER_AGENT
from src.utils.logger import get_logger

log = get_logger("booking")

DEFAULT_HEADERS = {
    "accept": "application/json",
    "accept-language": "ko-KR,ko;q=0.9",
    "content-type": "application/json",
    "origin": "https://www.booking.com",
    "referer": "https://www.booking.com/",
    "user-agent": USER_AGENT,
}


class BookingClient(BaseClient):
    """부킹닷컴 가격 수집 클라이언트."""

    def __init__(self):
        super().__init__(name="booking", headers=DEFAULT_HEADERS)

    async def get_hotel_price(
        self,
        site_id: str,
        check_in: str,
        check_out: str,
    ) -> dict | None:
        """
        부킹닷컴에서 특정 호텔의 가격을 조회합니다.
        """
        try:
            client = await self._get_client()

            url = "https://www.booking.com/searchresults.ko.html"
            params = {
                "dest_id": site_id,
                "dest_type": "hotel",
                "checkin": check_in,
                "checkout": check_out,
                "group_adults": "2",
                "no_rooms": "1",
                "selected_currency": "KRW",
            }

            resp = await client.get(url, params=params)

            if resp.status_code == 403:
                self.log.warning("booking_blocked", site_id=site_id)
                return None

            if resp.status_code != 200:
                self.log.warning("booking_http_error", site_id=site_id, status=resp.status_code)
                return None

            price = self._extract_price_from_response(resp.text)
            if price is None:
                return None

            booking_url = f"https://www.booking.com/hotel/kr/{site_id}.ko.html?checkin={check_in}&checkout={check_out}"

            return {
                "price_krw": price["amount"],
                "room_type": price.get("room_type", "standard"),
                "url": booking_url,
            }

        except Exception as e:
            self.log.error("booking_error", site_id=site_id, error=str(e))
            return None

    def _extract_price_from_response(self, html: str) -> dict | None:
        """응답에서 최저가를 추출합니다."""
        try:
            # Try Structured Data (JSON-LD)
            ld_pattern = r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'
            matches = re.findall(ld_pattern, html, re.DOTALL)

            for match in matches:
                try:
                    ld_data = json.loads(match)
                    if isinstance(ld_data, dict):
                        offers = ld_data.get("offers", {})
                        price = offers.get("lowPrice") or offers.get("price")
                        if price:
                            return {"amount": int(float(price)), "room_type": "standard"}
                except json.JSONDecodeError:
                    continue

            # Fallback: data-price attribute
            price_pattern = r'data-price["\s=:]+["\']?(\d[\d,]+)'
            price_match = re.search(price_pattern, html)
            if price_match:
                price_str = price_match.group(1).replace(",", "")
                return {"amount": int(price_str), "room_type": "standard"}

            return None
        except Exception:
            return None
