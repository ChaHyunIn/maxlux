import os
from datetime import UTC, datetime

import httpx

from src.clients.supabase_client import get_client
from src.utils.logger import get_logger

log = get_logger("exchange_rate_sync")

# 무료 환율 API (Frankfurter — ECB 기반, 무제한)
API_URL = "https://api.frankfurter.app/latest?from=USD&to=KRW"


async def sync_exchange_rate():
    """
    외부 API에서 USD/KRW 환율을 가져와 DB의 system_settings 테이블을 업데이트합니다.
    API 실패 시 기존 데이터를 보존하고 에러만 로깅합니다.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(API_URL)
            resp.raise_for_status()
            data = resp.json()

        rate = data.get("rates", {}).get("KRW")
        if not rate:
            log.error("exchange_rate_not_found", data=data)
            return None

        # 환율 유효성 검증 (비정상 값 방지)
        if rate <= 0 or rate > 100000:
            log.error("exchange_rate_invalid", rate=rate)
            return None

        db = get_client()
        settings_data = {
            "key": "exchange_rate_usd",
            "value": {
                "rate": rate,
                "source": "frankfurter",
                "date": data.get("date"),
                "synced_at": datetime.now(UTC).isoformat(),
            },
            "updated_at": datetime.now(UTC).isoformat(),
        }

        # Upsert (PK = key 기준)
        db.table("system_settings").upsert(
            settings_data, on_conflict="key"
        ).execute()

        log.info("exchange_rate_synced", rate=rate, date=data.get("date"))
        return rate

    except Exception as e:
        log.error("exchange_rate_sync_failed", error=str(e))
        return None


if __name__ == "__main__":
    import asyncio
    asyncio.run(sync_exchange_rate())
