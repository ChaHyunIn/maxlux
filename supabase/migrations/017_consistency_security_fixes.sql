-- Phase 6: Consistency & Security Fixes (Audit Response)

-- C1: price_alerts RLS 정책 충돌 해결
-- 013에서 생성된 광범위한 조회 권한을 삭제하고 INSERT 전용으로 전환
DROP POLICY IF EXISTS "Users can read own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Anyone can create price alerts" ON price_alerts;

-- 신규 정책: 공개 사용자(anon)는 등록(INSERT)만 가능
CREATE POLICY "Anon insert only" ON price_alerts FOR INSERT WITH CHECK (true);
-- SELECT, UPDATE, DELETE는 정책이 없으므로 RLS에 의해 기본적으로 차단됨 (Service Role만 가능)

-- M3: daily_rates tag 체크 제약 조건 업데이트 (HOL_EVE 추가)
ALTER TABLE daily_rates DROP CONSTRAINT IF EXISTS daily_rates_tag_check;
ALTER TABLE daily_rates ADD CONSTRAINT daily_rates_tag_check 
    CHECK (tag IN ('SAT', 'FRI_EVE', 'HOL', 'HOL_EVE', 'SUN', 'WEEKDAY'));

-- m5: price_alerts currency 컬럼 NOT NULL 설정
ALTER TABLE price_alerts ALTER COLUMN currency SET NOT NULL;

-- C2/M1: 주석 및 일관성 정리 (참조용)
COMMENT ON TABLE price_changes IS 'CDC 기반 가격 변동 이력. Public SELECT는 허용하되 주석 모순 정리.';
COMMENT ON VIEW hotels_with_min_price IS '호텔별 최저가 뷰. 010을 014가 덮어쓰므로 014 정의가 최종본임.';
