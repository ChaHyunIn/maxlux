import os

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

HOTELLUX_BASE_URL = "https://hotel.hotelux.com/services/booking/hotel"
HOTELLUX_SESSION_COOKIE = os.getenv("HOTELLUX_SESSION_COOKIE")

CITIES = os.getenv("SCRAPE_CITIES", "seoul,busan,jeju").split(",")
MAX_RETRIES = 3
RETRY_WAIT_SEC = 30

RATE_COLLECTION_CONCURRENCY = int(os.getenv("RATE_COLLECTION_CONCURRENCY", 5))
RATE_COLLECTION_BATCH_SIZE = int(os.getenv("RATE_COLLECTION_BATCH_SIZE", 500))
RATE_COLLECTION_TIMEOUT = int(os.getenv("RATE_COLLECTION_TIMEOUT", 120))
RATE_COLLECTION_MAX_RETRIES = int(os.getenv("RATE_COLLECTION_MAX_RETRIES", 3))

# Chrome 버전은 주기적으로 업데이트 필요. 너무 오래된 UA는 차단될 수 있음.
USER_AGENT = os.getenv(
    "SCRAPER_USER_AGENT",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36",
)

DEFAULT_HEADERS = {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "origin": "https://hotel.hotelux.com",
    "referer": "https://hotel.hotelux.com/",
    "x-requested-with": "XMLHttpRequest",
    "y-platform-channel": "hotelux",
    "y-platform-language": os.getenv("SCRAPE_LANGUAGE", "ko"),
    "y-raw-required": "false",
    "y-src": "ysys-web",
    "user-agent": USER_AGENT,
}

HOTELLUX_RATES_URL = "https://hotel.hotelux.com/services/booking/hotel/rates?mode=asyncPagingMerged"
DETAIL_SCRAPE_DAYS_AHEAD = 90
# Benefit estimation (KRW)
BENEFIT_VALUE_CREDIT_100USD = int(os.getenv("BENEFIT_VALUE_CREDIT_100USD", "135000"))
BENEFIT_VALUE_BREAKFAST_FOR_2 = int(os.getenv("BENEFIT_VALUE_BREAKFAST_FOR_2", "120000"))

# Pagination / request delay
PAGING_LIMIT = int(os.getenv("PAGING_LIMIT", "20"))
REQUEST_DELAY_SEC = float(os.getenv("REQUEST_DELAY_SEC", "1.5"))

# Feature flags / Retention
OTA_DAYS_AHEAD = int(os.getenv("OTA_DAYS_AHEAD", "14"))
RETENTION_MONTHS = int(os.getenv("RETENTION_MONTHS", "6"))
