from datetime import date

from src.services.tagger import tag_date


def test_saturday():
    assert tag_date(date(2026, 4, 11), set()) == "SAT"

def test_friday():
    assert tag_date(date(2026, 4, 10), set()) == "FRI_EVE"

def test_sunday():
    assert tag_date(date(2026, 4, 12), set()) == "SUN"

def test_weekday():
    assert tag_date(date(2026, 4, 13), set()) == "WEEKDAY"

def test_holiday():
    holidays = {date(2026, 5, 5)}
    assert tag_date(date(2026, 5, 5), holidays) == "HOL"

def test_holiday_eve():
    holidays = {date(2026, 5, 5)}
    assert tag_date(date(2026, 5, 4), holidays) == "FRI_EVE"
