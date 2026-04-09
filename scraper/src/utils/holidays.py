"""
공휴일 관리 유틸리티.
- 공공데이터포털 API로 자동 수집 시도
- API 실패 시 수동 하드코딩 데이터로 fallback
"""
import os
import httpx
from datetime import date
from src.utils.logger import get_logger

log = get_logger("holidays")

# 공공데이터포털 공휴일 API
DATA_GO_KR_API_KEY = os.getenv("DATA_GO_KR_API_KEY", "")
HOLIDAY_API_URL = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo"

# Fallback: 수동 공휴일 데이터
HOLIDAYS_2026 = [
    ("2026-01-01", "신정", "New Year's Day", False),
    ("2026-01-28", "설날 전날", "Lunar New Year Eve", False),
    ("2026-01-29", "설날", "Lunar New Year", False),
    ("2026-01-30", "설날 다음날", "Lunar New Year +1", False),
    ("2026-03-01", "삼일절", "Independence Movement Day", False),
    ("2026-03-02", "삼일절 대체공휴일", "Independence Movement Day (Substitute)", True),
    ("2026-05-05", "어린이날", "Children's Day", False),
    ("2026-05-24", "부처님오신날", "Buddha's Birthday", False),
    ("2026-05-25", "부처님오신날 대체공휴일", "Buddha's Birthday (Substitute)", True),
    ("2026-06-06", "현충일", "Memorial Day", False),
    ("2026-08-15", "광복절", "Liberation Day", False),
    ("2026-08-17", "광복절 대체공휴일", "Liberation Day (Substitute)", True),
    ("2026-09-24", "추석 전날", "Chuseok Eve", False),
    ("2026-09-25", "추석", "Chuseok", False),
    ("2026-09-26", "추석 다음날", "Chuseok +1", False),
    ("2026-10-03", "개천절", "National Foundation Day", False),
    ("2026-10-05", "개천절 대체공휴일", "National Foundation Day (Substitute)", True),
    ("2026-10-09", "한글날", "Hangul Day", False),
    ("2026-12-25", "크리스마스", "Christmas", False),
]

HOLIDAYS_2027 = [
    ("2027-01-01", "신정", "New Year's Day", False),
    ("2027-02-16", "설날 전날", "Lunar New Year Eve", False),
    ("2027-02-17", "설날", "Lunar New Year", False),
    ("2027-02-18", "설날 다음날", "Lunar New Year +1", False),
    ("2027-03-01", "삼일절", "Independence Movement Day", False),
    ("2027-05-05", "어린이날", "Children's Day", False),
    ("2027-05-13", "부처님오신날", "Buddha's Birthday", False),
    ("2027-06-06", "현충일", "Memorial Day", False),
    ("2027-08-15", "광복절", "Liberation Day", False),
    ("2027-08-16", "광복절 대체공휴일", "Liberation Day (Substitute)", True),
    ("2027-10-03", "개천절", "National Foundation Day", False),
    ("2027-10-04", "개천절 대체공휴일", "National Foundation Day (Substitute)", True),
    ("2027-10-09", "한글날", "Hangul Day", False),
    ("2027-10-13", "추석 전날", "Chuseok Eve", False),
    ("2027-10-14", "추석", "Chuseok", False),
    ("2027-10-15", "추석 다음날", "Chuseok +1", False),
    ("2027-12-25", "크리스마스", "Christmas", False),
]

FALLBACK_HOLIDAYS = {
    2026: HOLIDAYS_2026,
    2027: HOLIDAYS_2027,
}


async def fetch_holidays_from_api(year: int) -> list[tuple] | None:
    """공공데이터포털 API에서 공휴일 데이터를 가져옵니다."""
    if not DATA_GO_KR_API_KEY:
        log.info("holiday_api_skipped", reason="no API key configured")
        return None

    holidays = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            for month in range(1, 13):
                params = {
                    "serviceKey": DATA_GO_KR_API_KEY,
                    "solYear": str(year),
                    "solMonth": str(month).zfill(2),
                    "_type": "json",
                    "numOfRows": "30",
                }
                resp = await client.get(HOLIDAY_API_URL, params=params)

                if resp.status_code != 200:
                    log.warning("holiday_api_error", month=month, status=resp.status_code)
                    continue

                data = resp.json()
                body = data.get("response", {}).get("body", {})
                items = body.get("items", {})

                if not items:
                    continue

                item_list = items.get("item", [])
                # API returns single item as dict, multiple as list
                if isinstance(item_list, dict):
                    item_list = [item_list]

                for item in item_list:
                    if item.get("isHoliday") != "Y":
                        continue
                    locdate = str(item.get("locdate", ""))
                    if len(locdate) == 8:
                        date_str = f"{locdate[:4]}-{locdate[4:6]}-{locdate[6:8]}"
                        name_ko = item.get("dateName", "")
                        is_sub = "대체" in name_ko
                        holidays.append((date_str, name_ko, name_ko, is_sub))

        if holidays:
            log.info("holiday_api_success", year=year, count=len(holidays))
            return holidays
        else:
            log.warning("holiday_api_empty", year=year)
            return None

    except Exception as e:
        log.error("holiday_api_failed", year=year, error=str(e))
        return None


def get_fallback_holidays(year: int) -> list[tuple]:
    """하드코딩된 fallback 공휴일 데이터를 반환합니다."""
    return FALLBACK_HOLIDAYS.get(year, [])


async def seed_holidays_auto(supabase_client, year: int | None = None):
    """
    공휴일을 DB에 시드합니다.
    1. 공공데이터포털 API 시도
    2. 실패 시 fallback 하드코딩 데이터 사용
    """
    if year is None:
        year = date.today().year

    # Try API first
    holidays_data = await fetch_holidays_from_api(year)

    if holidays_data:
        source = "api"
    else:
        # Fallback to hardcoded data
        holidays_data = get_fallback_holidays(year)
        source = "fallback"

    if not holidays_data:
        log.warning("no_holidays_data", year=year)
        return 0

    count = 0
    for entry in holidays_data:
        date_str, name_ko, name_en, is_sub = entry
        supabase_client.table("holidays").upsert({
            "date": date_str,
            "name_ko": name_ko,
            "name_en": name_en,
            "is_substitute": is_sub,
            "year": year,
        }, on_conflict="date").execute()
        count += 1

    log.info("holidays_seeded", year=year, count=count, source=source)
    return count


def seed_holidays(supabase_client):
    """
    [DEPRECATED] 동기 호환 래퍼 — 기존 main.py 호출부 호환용.
    대신 seed_holidays_auto(client)를 사용하세요.
    """
    for date_str, name_ko, name_en, is_sub in HOLIDAYS_2026:
        supabase_client.table("holidays").upsert({
            "date": date_str,
            "name_ko": name_ko,
            "name_en": name_en,
            "is_substitute": is_sub,
            "year": 2026,
        }, on_conflict="date").execute()
    # 2027년도 시드
    for date_str, name_ko, name_en, is_sub in HOLIDAYS_2027:
        supabase_client.table("holidays").upsert({
            "date": date_str,
            "name_ko": name_ko,
            "name_en": name_en,
            "is_substitute": is_sub,
            "year": 2027,
        }, on_conflict="date").execute()


def load_holidays(supabase_client=None, year: int | None = None) -> set[date]:
    """Load holidays from DB. Caller should cache the result if needed."""
    if supabase_client is None:
        from src.clients.supabase_client import get_client
        supabase_client = get_client()
    query = supabase_client.table("holidays").select("date")
    if year:
        query = query.eq("year", year)
    result = query.execute()
    holidays = {date.fromisoformat(row["date"]) for row in result.data}
    log.info("holidays_loaded", count=len(holidays))
    return holidays
