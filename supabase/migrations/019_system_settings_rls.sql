-- Phase 6: system_settings 테이블 보안 강화
-- system_settings에 RLS 미적용 상태 → 악의적 사용자가 anon key로 환율 변조 가능 (Critical)

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 읽기 전용: 프론트엔드(anon)는 환율 등 설정값 조회만 가능
CREATE POLICY "Public read system_settings" ON system_settings FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE는 정책이 없으므로 RLS에 의해 기본 차단됨 (service_role만 가능)
COMMENT ON TABLE system_settings IS '시스템 설정 (환율 등). anon은 SELECT만 허용, 쓰기는 service_role 전용.';
