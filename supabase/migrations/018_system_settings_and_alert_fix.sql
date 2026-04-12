-- Phase 6: System Settings and Price Alert Constraint Fix

-- 1. system_settings 테이블 생성
CREATE TABLE IF NOT EXISTS system_settings (
    key          TEXT PRIMARY KEY,
    value        JSONB NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 초기 환율 데이터 (Fallback 용)
INSERT INTO system_settings (key, value)
VALUES ('exchange_rate_usd', '{"rate": 1400, "source": "initial"}')
ON CONFLICT (key) DO NOTHING;

-- 2. price_alerts 중복 방지 제약 조건 강화
-- 기존 제약 조건 삭제 (이름은 013 migration 기준)
-- 정확한 이름을 위해 인덱스를 먼저 찾거나 IF EXISTS 활용
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'price_alerts_hotel_id_email_target_price_key') THEN
        ALTER TABLE price_alerts DROP CONSTRAINT price_alerts_hotel_id_email_target_price_key;
    END IF;
END $$;

-- 기존 중복 데이터 정리 (가장 최신 것만 남김)
DELETE FROM price_alerts a
USING price_alerts b
WHERE a.id < b.id
  AND a.hotel_id = b.hotel_id
  AND a.email = b.email
  AND a.target_price = b.target_price
  AND COALESCE(a.stay_date_from, '1900-01-01') = COALESCE(b.stay_date_from, '1900-01-01')
  AND COALESCE(a.stay_date_to, '9999-12-31') = COALESCE(b.stay_date_to, '9999-12-31');

-- Null-safe Unique Index 생성 (stay_date_from/to가 NULL인 경우도 고유하게 식별)
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_alerts_unique_inclusive 
    ON price_alerts (
        hotel_id, 
        email, 
        target_price, 
        COALESCE(stay_date_from, '1900-01-01'), 
        COALESCE(stay_date_to, '9999-12-31')
    );

COMMENT ON INDEX idx_price_alerts_unique_inclusive IS '날짜가 포함된 유저별/가격별 고유 알림 제약 조건 (NULL 허용 처리 완료)';
