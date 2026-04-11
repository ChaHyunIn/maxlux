-- Final Security Updates (Phase 6)

-- 1. room_rates (객실 상세 요금)
ALTER TABLE room_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read room_rates" ON room_rates FOR SELECT USING (true);

-- 2. price_changes (가격 변동 이력)
ALTER TABLE price_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read price_changes" ON price_changes FOR SELECT USING (true);

-- 3. price_alerts (가격 알림 신청)
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
-- 사용자는 알림 등록(INSERT)만 가능
CREATE POLICY "Allow public insert price_alerts" ON price_alerts FOR INSERT WITH CHECK (true);
-- 조회, 수정, 삭제는 public(anon)에게 일체 비허용 (service_role만 가능)

-- 4. scrape_logs (스크래퍼 실행 로그)
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;
-- Public 접근 정책 없음 (기본적으로 모두 차단됨)

-- 5. ota_sources (OTA 정보 - 이전 마이그레이션 누락분 확인)
-- 009_enable_rls.sql에서 이미 처리됨
