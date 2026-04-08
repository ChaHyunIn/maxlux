# ⚠️ WARNING: 2026년 전용 수동 공휴일 데이터.
# 매년 1월에 새 해 데이터로 업데이트 필요! (향후 공공데이터포털 API 자동화 예정)
# Phase 1: 수동 입력. Phase 2에서 공공데이터포털 API 자동화.
HOLIDAYS_2026 = [
    ("2026-01-01", "신정", "New Year's Day", False),
    ("2026-01-28", "설날 전날", "Lunar New Year Eve", False),
    ("2026-01-29", "설날", "Lunar New Year", False),
    ("2026-01-30", "설날 다음날", "Lunar New Year +1", False),
    ("2026-03-01", "삼일절", "Independence Movement Day", False),
    ("2026-05-05", "어린이날", "Children's Day", False),
    ("2026-05-24", "부처님오신날", "Buddha's Birthday", False),
    ("2026-06-06", "현충일", "Memorial Day", False),
    ("2026-08-15", "광복절", "Liberation Day", False),
    ("2026-09-24", "추석 전날", "Chuseok Eve", False),
    ("2026-09-25", "추석", "Chuseok", False),
    ("2026-09-26", "추석 다음날", "Chuseok +1", False),
    ("2026-10-03", "개천절", "National Foundation Day", False),
    ("2026-10-09", "한글날", "Hangul Day", False),
    ("2026-12-25", "크리스마스", "Christmas", False),
]

def seed_holidays(supabase_client):
    """holidays 테이블에 2026년 공휴일 삽입"""
    for date_str, name_ko, name_en, is_sub in HOLIDAYS_2026:
        supabase_client.table("holidays").upsert({
            "date": date_str,
            "name_ko": name_ko,
            "name_en": name_en,
            "is_substitute": is_sub,
            "year": 2026,
        }, on_conflict="date").execute()
