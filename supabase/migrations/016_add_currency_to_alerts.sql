-- Add currency column to price_alerts (Phase 6)

ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KRW';

-- 기존 데이터가 있다면 KRW로 설정
UPDATE price_alerts SET currency = 'KRW' WHERE currency IS NULL;
