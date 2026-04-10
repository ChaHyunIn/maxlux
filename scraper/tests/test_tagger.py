from datetime import date
from src.services.tagger import tag_date

def test_holiday():
    holidays = {date(2026, 1, 1)}
    assert tag_date(date(2026, 1, 1), holidays) == "HOL"

def test_friday():
    assert tag_date(date(2026, 4, 10), set()) == "FRI_EVE"  # 2026-04-10은 금요일

def test_hol_eve():
    holidays = {date(2026, 4, 11)}  # 토요일이 공휴일
    assert tag_date(date(2026, 4, 10), holidays) == "FRI_EVE"  # 금요일이 우선
    assert tag_date(date(2026, 4, 9), holidays) == "HOL_EVE"  # 목요일 → HOL_EVE

def test_saturday():
    assert tag_date(date(2026, 4, 11), set()) == "SAT"

def test_weekday():
    assert tag_date(date(2026, 4, 13), set()) == "WEEKDAY"  # 월요일

def test_sunday():
    assert tag_date(date(2026, 4, 12), set()) == "SUN"
