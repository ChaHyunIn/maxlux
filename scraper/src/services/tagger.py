from datetime import date, timedelta
from src.utils.logger import get_logger

log = get_logger("tagger")


from src.utils.holidays import load_holidays


def tag_date(stay_date: date, holidays: set[date]) -> str:
    """Tag a date based on its day of week and holiday status."""
    if stay_date in holidays:
        return "HOL"
    next_day = stay_date + timedelta(days=1)
    if stay_date.weekday() == 4:
        return "FRI_EVE"
    if next_day in holidays:
        return "FRI_EVE"
    if stay_date.weekday() == 5:
        return "SAT"
    if stay_date.weekday() == 6:
        return "SUN"
    return "WEEKDAY"
