-- Phase 6: DB 성능 최적화 - Materialized View 전환
-- 기존 실시간 View는 데이터셋이 커질수록 조회 성능이 저하되므로, 사전 계산된 Materialized View로 전환합니다.

-- 1. 기존 View 삭제
DROP VIEW IF EXISTS hotels_with_min_price;

-- 2. Materialized View 생성
CREATE MATERIALIZED VIEW hotels_with_min_price AS
SELECT
    h.*,
    (
        SELECT MIN(dr.price_krw)
        FROM daily_rates dr
        WHERE dr.hotel_id = h.id 
          AND dr.is_sold_out = FALSE 
          AND dr.stay_date >= CURRENT_DATE
          AND dr.price_krw > 0
    ) AS min_price,
    (
        SELECT COUNT(*)::INTEGER
        FROM price_changes pc
        WHERE pc.hotel_id = h.id
          AND pc.changed_at >= NOW() - INTERVAL '48 hours'
          AND pc.new_price < pc.old_price
    ) AS recent_drops
FROM hotels h
WHERE h.is_active = true;

-- 3. 고유 인덱스 생성 (CONCURRENTLY 리프레시를 위해 필수)
CREATE UNIQUE INDEX idx_hotels_with_min_price_id ON hotels_with_min_price(id);

-- 4. 리프레시 함수 정의
-- 스크래퍼 작업 완료 후 또는 주기적으로 호출하여 데이터를 갱신합니다.
CREATE OR REPLACE FUNCTION refresh_hotels_with_min_price()
RETURNS void AS $$
BEGIN
  -- CONCURRENTLY 옵션으로 조회 중단을 방지합니다.
  REFRESH MATERIALIZED VIEW CONCURRENTLY hotels_with_min_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 권한 설정
-- service_role만 실행 가능 (보안: 일반 사용자가 MV refresh 호출 불가)
REVOKE EXECUTE ON FUNCTION refresh_hotels_with_min_price() FROM public;
GRANT EXECUTE ON FUNCTION refresh_hotels_with_min_price() TO service_role;

-- 6. 설명 추가
COMMENT ON MATERIALIZED VIEW hotels_with_min_price IS '호텔별 최저가 및 가격 하락 징후 집계 테이블 (성능 최적화를 위한 Materialized View)';
COMMENT ON FUNCTION refresh_hotels_with_min_price() IS '호텔 최저가 데이터 캐시를 수동으로 갱신하는 함수';
