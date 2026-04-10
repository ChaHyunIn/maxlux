import asyncio

import httpx
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_fixed

from src.clients.base_client import BaseOtaClient
from src.config import (
    DEFAULT_HEADERS,
    HOTELLUX_BASE_URL,
    HOTELLUX_RATES_URL,
    HOTELLUX_SESSION_COOKIE,
    MAX_RETRIES,
    PAGING_LIMIT,
    REQUEST_DELAY_SEC,
    RETRY_WAIT_SEC,
)
from src.utils.logger import get_logger

log = get_logger("hotellux")


class SessionExpiredError(Exception):
    pass


def should_retry(e):
    return isinstance(e, (httpx.HTTPError, asyncio.TimeoutError)) and getattr(e.response, "status_code", 200) not in (
        401,
        403,
    )


class HotelLuxClient(BaseOtaClient):
    def __init__(self):
        super().__init__(base_url=HOTELLUX_BASE_URL, headers={**DEFAULT_HEADERS})
        if HOTELLUX_SESSION_COOKIE:
            self.headers["cookie"] = f"connect.sid={HOTELLUX_SESSION_COOKIE}"

    @retry(
        stop=stop_after_attempt(MAX_RETRIES),
        wait=wait_fixed(RETRY_WAIT_SEC),
        retry=retry_if_exception(should_retry),
        reraise=True,
    )
    async def search_hotels(self, city: str, check_in: str, check_out: str, skip: int = 0) -> dict:
        url = f"{self.base_url}/search?mode=async"

        lang = self.headers.get("y-platform-language", "ko")
        payload = {
            "preferred": {"currency": "KRW", "language": lang, "version": "v1"},
            "filter": {"search": city},
            "stay": {"date": {"checkIn": check_in, "checkOut": check_out}},
            "paging": {"limit": PAGING_LIMIT, "skip": skip},
            "sort": "byRecommendation",
            "options": {"extraBrandsRequired": True},
        }

        client = await self._get_client()

        resp = await client.post(url, json=payload)

        if resp.status_code in (401, 403):
            log.error("auth_error", message="Authentication failed")
            raise SessionExpiredError("Authentication Error")

        resp.raise_for_status()

        try:
            data = resp.json()
        except Exception as e:
            raise Exception("Invalid JSON response") from e

        # 바로 결과 반환
        if not data.get("asyncJobId"):
            log.info("search_complete", city=city, date=check_in, hotels_count=len(data.get("hotels", [])))
            return data

        # polling
        job_id = data["asyncJobId"]
        poll_url = f"{self.base_url}/search?mode=async&asyncJobId={job_id}"

        max_poll = 20

        for i in range(max_poll):
            await asyncio.sleep(min(REQUEST_DELAY_SEC * (2**i), 10))

            poll_resp = await client.post(poll_url, json=payload)
            poll_resp.raise_for_status()

            if not poll_resp.content:
                continue

            try:
                poll_data = poll_resp.json()
            except Exception:
                continue

            if not poll_data.get("asyncJobId"):
                log.info("search_complete", city=city, date=check_in, hotels_count=len(poll_data.get("hotels", [])))
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

            # 안전한 종료 조건
            if total == 0:
                break
            if skip >= total:
                break
            if skip > 10000:
                raise Exception("pagination runaway")

            skip += PAGING_LIMIT
            await asyncio.sleep(REQUEST_DELAY_SEC)

        log.info("search_all_complete", city=city, total=len(all_hotels))
        return all_hotels

    async def get_hotel_rates(self, hotel_id: str, check_in: str, check_out: str) -> dict | None:
        """
        개별 호텔의 전체 객실/요금 플랜을 조회합니다.

        API: POST /hotel/rates?mode=asyncPagingMerged
        Payload에 hotel._id를 지정하면 해당 호텔의 rooms[].rates[] 전체를 반환.

        Args:
            hotel_id: HotelLux 내부 ID (예: "5b59645a8885d57e94df4ec2")
            check_in: ISO date (예: "2026-06-01")
            check_out: ISO date (예: "2026-06-02")

        Returns:
            API 응답 dict (rooms 배열 포함) 또는 None (실패 시)
        """
        lang = self.headers.get("y-platform-language", "ko")
        payload = {
            "preferred": {"currency": "local", "language": lang, "version": "v1"},
            "hotel": {"_id": hotel_id},
            "stay": {
                "date": {"checkIn": check_in, "checkOut": check_out},
                "guest": {"numberOfRooms": 1, "numberOfAdults": 2, "numberOfChildren": 0},
            },
        }

        client = await self._get_client()

        for attempt in range(MAX_RETRIES):
            try:
                resp = await client.post(HOTELLUX_RATES_URL, json=payload)

                if resp.status_code == 429:
                    log.warning("rate_limited", hotel_id=hotel_id, attempt=attempt + 1)
                    await asyncio.sleep(RETRY_WAIT_SEC)
                    continue

                if resp.status_code in (401, 403):
                    log.error("auth_error_detail", hotel_id=hotel_id)
                    raise SessionExpiredError("Authentication Error")

                resp.raise_for_status()
                data = resp.json()

                rooms = data.get("rooms", [])
                total_rates = sum(len(r.get("rates", [])) for r in rooms)
                log.info("hotel_rates_fetched", hotel_id=hotel_id, date=check_in, rooms=len(rooms), rates=total_rates)

                return data

            except SessionExpiredError:
                raise
            except (TimeoutError, httpx.HTTPError) as e:
                log.warning("hotel_rates_error", hotel_id=hotel_id, attempt=attempt + 1, error=str(e))
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_WAIT_SEC)

        log.error("hotel_rates_failed", hotel_id=hotel_id, date=check_in)
        return None
