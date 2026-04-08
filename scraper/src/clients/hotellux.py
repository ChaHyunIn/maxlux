import httpx
import asyncio
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from src.config import (
    HOTELLUX_BASE_URL, HOTELLUX_SESSION_COOKIE,
    DEFAULT_HEADERS, PAGING_LIMIT, REQUEST_DELAY_SEC,
    MAX_RETRIES, RETRY_WAIT_SEC,
)
from src.utils.logger import get_logger

log = get_logger("hotellux")


class SessionExpiredError(Exception):
    pass

def should_retry(e):
    return type(e) in (httpx.HTTPStatusError, httpx.ConnectTimeout) and not getattr(e.response, "status_code", 200) in (401, 403)

class HotelLuxClient:
    def __init__(self):
        self.base_url = HOTELLUX_BASE_URL
        self.headers = {
            **DEFAULT_HEADERS,
            "cookie": f"connect.sid={HOTELLUX_SESSION_COOKIE}",
        }
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Reuse a single AsyncClient for connection pooling."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30, headers=self.headers)
        return self._client

    async def close(self):
        """Gracefully close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    @retry(
        stop=stop_after_attempt(MAX_RETRIES),
        wait=wait_fixed(RETRY_WAIT_SEC),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectTimeout)),
        reraise=True
    )
    async def search_hotels(self, city: str, check_in: str, check_out: str, skip: int = 0) -> dict:
        url = f"{self.base_url}/search?mode=async"
        payload = {
            "preferred": {"currency": "KRW", "language": "ko", "version": "v1"},
            "filter": {"search": city},
            "stay": {"date": {"checkIn": check_in, "checkOut": check_out}},
            "paging": {"limit": PAGING_LIMIT, "skip": skip},
            "sort": "byRecommendation",
            "options": {"extraBrandsRequired": True},
        }

        client = await self._get_client()
        resp = await client.post(url, json=payload)
        if resp.status_code in (401, 403):
            log.error("session_expired", message="connect.sid cookie is expired or invalid")
            raise SessionExpiredError("Session cookie expired")
        resp.raise_for_status()
        data = resp.json()

        # If no asyncJobId, the result is already complete
        if not data.get("asyncJobId"):
            log.info("search_complete", city=city, date=check_in,
                     hotels_count=len(data.get("hotels", [])))
            return data

        # Poll for async result
        job_id = data["asyncJobId"]
        poll_url = f"{self.base_url}/search?mode=async&asyncJobId={job_id}"
        for _ in range(30):
            await asyncio.sleep(REQUEST_DELAY_SEC)
            poll_resp = await client.post(poll_url, json=payload)
            poll_resp.raise_for_status()
            if not poll_resp.content:
                continue
            try:
                poll_data = poll_resp.json()
            except Exception:
                continue
            if not poll_data.get("asyncJobId"):
                log.info("search_complete", city=city, date=check_in,
                         hotels_count=len(poll_data.get("hotels", [])))
                return poll_data
        log.warning("search_timeout", city=city, date=check_in)
        return {"hotels": []}

    async def search_all_hotels(self, city: str, check_in: str, check_out: str) -> list:
        all_hotels = []
        skip = 0
        while True:
            data = await self.search_hotels(city, check_in, check_out, skip=skip)
            hotels = data.get("hotels", [])
            all_hotels.extend(hotels)
            paging = data.get("paging", {})
            total = paging.get("count", 0)
            if skip + PAGING_LIMIT >= total:
                break
            skip += PAGING_LIMIT
            await asyncio.sleep(REQUEST_DELAY_SEC)
        log.info("search_all_complete", city=city, total=len(all_hotels))
        return all_hotels
