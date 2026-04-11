import os
from datetime import UTC, datetime

import httpx

from src.clients.supabase_client import get_client
from src.utils.logger import get_logger

log = get_logger("exchange_rate_sync")

# 무료 환율 API (Frankfurter)
# base=USD, targets=KRW
API_URL = "https://api.frankfurter.app/latest?from=USD&to=KRW"


async def sync_exchange_rate():
    """
    외부 API에서 USD/KRW 환율을 가져와 DB의 system_settings 테이블을 업데이트합니다.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(API_URL)
            resp.raise_for_status()
            data = resp.json()

        rate = data.get("rates", {}).get("KRW")
        if not rate:
            log.error("exchange_rate_not_found", data=data)
            return

        db = get_client()
        settings_data = {
            "key": "exchange_rate_usd",
            "value": {
                "rate": rate,
                "source": "frankfurter",
                "date": data.get("date"),
            },
            "updated_at": datetime.now(UTC).isoformat(),
        }

        # Upsert
        res = db.table("system_settings").upsert(settings_data).execute()
        
        log.info("exchange_rate_synced", rate=rate, date=data.get("date"))
        return rate

    except Exception as e:
        log.error("exchange_rate_sync_failed", error=str(e))
        return None


if __name__ == "__main__":
    import asyncio
    asyncio.run(sync_exchange_rate())
