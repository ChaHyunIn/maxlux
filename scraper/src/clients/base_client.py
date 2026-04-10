from abc import ABC, abstractmethod
from typing import Any

import httpx


class BaseOtaClient(ABC):
    """
    Abstract base class for all OTA (Online Travel Agency) scraper clients.
    Ensures a consistent interface for hotel search and rate retrieval.
    """

    def __init__(self, base_url: str, headers: dict[str, str] | None = None):
        self.base_url = base_url
        self.headers = headers or {}
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30, headers=self.headers)
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    @abstractmethod
    async def search_hotels(self, city: str, check_in: str, check_out: str, **kwargs) -> Any:
        """Search for hotels in a specific city for given stay dates."""

    @abstractmethod
    async def get_hotel_rates(self, hotel_id: str, check_in: str, check_out: str, **kwargs) -> dict[str, Any] | None:
        """Retrieve detailed room rates for a specific hotel."""
