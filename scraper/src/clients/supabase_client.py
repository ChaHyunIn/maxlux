from supabase import create_client
from src.config import SUPABASE_URL, SUPABASE_KEY
from src.utils.logger import get_logger

log = get_logger("supabase")
_client = None

def get_client():
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        log.info("supabase_connected")
    return _client
