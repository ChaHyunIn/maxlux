from supabase import create_client
from src.config import SUPABASE_URL, SUPABASE_KEY
from src.utils.logger import get_logger

log = get_logger("supabase")

def get_client():
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return client
    except Exception as e:
        log.error("supabase_connection_failed", exc_info=True, error=str(e))
        raise
