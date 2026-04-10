from typing import Any

from tenacity import retry, stop_after_attempt, wait_exponential

from ..utils.logger import logger
from .base_client import BaseOtaClient

HOTELLUX_BASE_URL = "https://api.hotellux.com/v1"
DEFAULT_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "MaxLux/1.0",
}


class HotelLuxClient(BaseOtaClient):
    """
    HotelLux OTA Client.
    """

    def __init__(self):
        super().__init__(base_url=HOTELLUX_BASE_URL, headers=DEFAULT_HEADERS)
        self.max_poll = 3

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def get_hotel_rates(
        self, hotel_id: str, check_in: str, check_out: str, **kwargs: Any
    ) -> dict[Any, Any] | None:
        """
        Fetches room rates for a specific hotel and date range.
        """
        payload = {
            "hotel_id": hotel_id,
            "check_in": check_in,
            "check_out": check_out,
            "language": "ko",
            **kwargs,
        }

        try:
            return await self.request("POST", "/rates/search", json=payload)
        except Exception as e:
            logger.error(f"Failed to fetch rates from HotelLux: {e}")
            return None
