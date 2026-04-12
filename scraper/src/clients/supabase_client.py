from supabase import create_client

from src.config import SUPABASE_KEY, SUPABASE_URL
from src.utils.logger import get_logger

log = get_logger("supabase")

_client = None


def get_client():
    """싱글턴 Supabase 클라이언트를 반환한다."""
    global _client
    if _client is None:
        try:
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
            log.info("supabase_client_created")
        except Exception as e:
            log.error("supabase_connection_failed", exc_info=True, error=str(e))
            raise
    return _client
