"""
베이스 스크래핑 클라이언트.
- 모든 스크래퍼 클라이언트가 상속받아 사용하는 공통 기능을 정의합니다.
- httpx.AsyncClient 생명주기 관리 및 세마포어 기반 배치 작업을 담당합니다.
"""

import asyncio
from abc import ABC, abstractmethod

import httpx

from src.config import REQUEST_DELAY_SEC, USER_AGENT
from src.utils.logger import get_logger

log = get_logger("base_client")


class BaseClient(ABC):
    """
    모든 가격 수집 클라이언트의 기반 클래스.
    """

    def __init__(self, name: str, headers: dict[str, str] | None = None):
        self.name = name
        self.log = get_logger(name)
        self.headers = headers or {
            "accept": "application/json",
            "accept-language": "ko-KR,ko;q=0.9",
            "user-agent": USER_AGENT,
        }
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        """클라이언트 인스턴스 반환 및 지연 초기화."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30,
                headers=self.headers,
                follow_redirects=True,
            )
        return self._client

    async def close(self):
        """클라이언트 리소스 해제."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    @abstractmethod
    async def get_hotel_price(self, site_id: str, check_in: str, check_out: str) -> dict | None:
        """
        단일 호텔 가격 조회 추상 메서드.
        각 클라이언트에서 자사 사이트에 맞게 구현해야 함.
        """

    async def get_prices_for_hotels(
        self,
        hotels: list[dict],
        check_in: str,
        check_out: str,
        id_key: str,
        semaphore: asyncio.Semaphore | None = None,
    ) -> list[dict]:
        """
        여러 호텔의 가격을 배치로 수집합니다.

        Args:
            hotels: [{"hotel_id": uuid, "xxx_id": str}, ...]
            check_in: "YYYY-MM-DD"
            check_out: "YYYY-MM-DD"
            id_key: 각 사이트별 식별자 키 (예: 'agoda_id', 'booking_id')
        """
        if semaphore is None:
            semaphore = asyncio.Semaphore(3)

        results = []

        for hotel in hotels:
            site_id = hotel.get(id_key)
            if not site_id:
                continue

            async with semaphore:
                price_data = await self.get_hotel_price(site_id, check_in, check_out)

            if price_data:
                results.append(
                    {
                        "hotel_id": hotel["hotel_id"],
                        "stay_date": check_in,
                        "source": self.name,
                        "price_krw": price_data["price_krw"],
                        "room_type": price_data.get("room_type", "standard"),
                        "url": price_data.get("url"),
                    }
                )

            # Rate limit 방지를 위한 지연
            await asyncio.sleep(REQUEST_DELAY_SEC)

        self.log.info(f"{self.name}_batch_done", date=check_in, found=len(results), total=len(hotels))
        return results
