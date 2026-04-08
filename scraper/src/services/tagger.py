from datetime import date, timedelta
from src.utils.logger import get_logger

log = get_logger("tagger")


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
