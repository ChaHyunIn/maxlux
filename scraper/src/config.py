import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

HOTELLUX_BASE_URL = "https://hotel.hotelux.com/services/booking/hotel"
HOTELLUX_SESSION_COOKIE = os.getenv("HOTELLUX_SESSION_COOKIE")

CITIES = ["seoul"]
SCRAPE_DAYS_AHEAD = 90
REQUEST_DELAY_SEC = 2.0
PAGING_LIMIT = 50
MAX_RETRIES = 3
RETRY_WAIT_SEC = 30

DEFAULT_HEADERS = {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "origin": "https://hotel.hotelux.com",
    "referer": "https://hotel.hotelux.com/",
    "x-requested-with": "XMLHttpRequest",
    "y-platform-channel": "hotelux",
    "y-platform-language": "ko",  # ⚠️ Hardcoded: 다국어 스크래핑 확장 시 동적으로 변경 필요
    "y-raw-required": "false",
    "y-src": "ysys-web",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/146.0.0.0 Safari/537.36",
}
