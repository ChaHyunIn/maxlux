from datetime import UTC, datetime
from typing import Any

from ..utils.logger import logger


class RateCollector:
    """
    Services to collect and process hotel rates.
    """

    def __init__(self, supabase):
        self.supabase = supabase

    async def save_daily_rates(self, hotel_id: str, rates: list[dict[str, Any]]):
        """
        Saves daily rates to Supabase.
        """
        if not rates:
            return

        now = datetime.now(UTC).isoformat()
        daily_rows: list[dict[str, Any]] = []

        for rate in rates:
            daily_rows.append(
                {
                    "hotel_id": hotel_id,
                    "stay_date": rate["stay_date"],
                    "price_krw": rate["price_krw"],
                    "is_sold_out": rate["is_sold_out"],
                    "scraped_at": now,
                }
            )

        try:
            self.supabase.table("daily_rates").upsert(daily_rows).execute()
        except Exception as e:
            logger.error(f"Failed to save daily rates: {e}")
