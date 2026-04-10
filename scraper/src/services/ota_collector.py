import asyncio
from typing import Any

from ..clients.agoda import AgodaClient
from ..clients.booking import BookingClient
from ..clients.hotellux import HotelLuxClient
from ..utils.logger import logger


class OtaCollector:
    """
    Collects hotel rates from multiple OTA sources.
    """

    def __init__(self):
        self.clients = [
            HotelLuxClient(),
            BookingClient(),
            AgodaClient(),
        ]

    async def collect_all(self, hotel_id: str, check_in: str, check_out: str) -> list[dict[str, Any]]:
        """
        Collects rates from all registered OTA clients in parallel.
        """
        tasks = [client.get_hotel_rates(hotel_id, check_in, check_out) for client in self.clients]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_prices: list[dict[str, Any]] = []
        for res in results:
            if isinstance(res, Exception):
                logger.error(f"OTA collection task failed: {res}")
                continue
            if res and isinstance(res, list):
                all_prices.extend(res)
            elif res and isinstance(res, dict):
                all_prices.append(res)

        return all_prices

    def aggregate_metrics(self, all_prices: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Aggregates metrics from the collected OTA prices.
        """
        if not all_prices:
            return {"is_sold_out": True, "is_error": True}

        return {
            "is_sold_out": any(p.get("is_sold_out", False) for p in all_prices),
            "is_error": any(p.get("is_error", False) for p in all_prices),
            "source_count": len(all_prices),
        }
