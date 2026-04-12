# MaxLux 전체 소스 코드 감사 보고서

전체 리포지토리의 모든 파일을 파일 단위로 읽고 분석한 결과입니다. 구조적 문제, 보안 취약점, 모듈 분리 필요성, 확장성 저해 요소를 카테고리별로 보고합니다.

---

## 1. 보안 — 치명적 (CRITICAL)

### 1-1. `apps/web/lib/supabase/server.ts` — Service Role Key 클라이언트 노출
`SUPABASE_SERVICE_ROLE_KEY`는 RLS(Row Level Security)를 완전히 우회하는 **관리자 키**입니다. 이 파일은 `server.ts`라는 이름이지만, Next.js API Route와 서버 컴포넌트 양쪽에서 사용되고 있습니다. 문제는 이 키가 서버 사이드에서만 사용되어야 하는데, 빌드 시 번들에 포함될 위험이 있다는 점입니다.

**조치**: 읽기 전용 함수(`getHotels`, `getRates` 등)는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용하는 별도 클라이언트로 분리하고, 쓰기가 필요한 함수(`createPriceAlert`, `deactivateAlert`)만 서비스 역할 키를 사용하되, API Route 내부에서만 인스턴스화해야 합니다.

### 1-2. `apps/web/lib/supabase/client.ts` — Anon Key 사용은 정상이나 RLS 미적용 위험
모든 데이터 접근이 `server.ts`의 service role 키를 통해 이뤄지므로, RLS 정책이 실질적으로 적용되지 않는 상태입니다.

### 1-3. API Routes — 인증/인가 완전 부재
`/api/hotels`, `/api/rates/[hotelId]`, `/api/ota-prices`, `/api/room-rates`, `/api/price-changes` 모든 엔드포인트가 **인증 없이 공개**되어 있습니다. 특히 `/api/price-alerts`의 POST/DELETE는 누구나 알림을 생성하거나 삭제할 수 있습니다.

### 1-4. `scraper/src/services/alert_checker.py` — API 키 노출 가능성
환경 변수 자체는 정상이나, `log.info("alert_sent", email=email, ...)`에서 이메일 주소를 그대로 로깅하고 있습니다. GitHub Actions 로그가 공개 리포지토리에서 노출될 수 있으므로 PII 마스킹이 필요합니다.

### 1-5. Scraper Session Cookie 관리
`HOTELLUX_SESSION_COOKIE`가 GitHub Secrets로 관리되지만, `config.py`에서 `connect.sid={cookie}` 형태로 하드코딩됩니다.

---

## 2. 구조적 문제 — 모듈 분리 필요

### 2-1. `scraper/src/main.py` — God Function 패턴 (270줄)
`run()` 함수 하나에 많은 책임이 혼재합니다.
- `pipeline/hotel_sync_phase.py`
- `pipeline/rate_collection_phase.py`
- `pipeline/post_scrape_phase.py`
- `pipeline/orchestrator.py`
등으로 분리 필요.

### 2-2. `apps/web/lib/supabase/server.ts` — 단일 파일에 13개 함수
읽기/쓰기가 섞여 있어 관심사별로 분리해야 합니다: `queries/hotels.ts`, `queries/rates.ts`, `queries/ota.ts`, `mutations/alerts.ts`.

### 2-3. `apps/web/components/calendar/HeatmapCalendar.tsx` — 데이터 로직과 UI 혼재
`useCalendarData.ts`로 추출 필요.

### 2-4. `apps/web/components/calendar/DayDetailModal.tsx` — 370줄 단일 컴포넌트
`OtaPriceList`, `RoomRateList`, `PriceHeader` 서브 컴포넌트로 분리.

### 2-5. `apps/web/components/hotel/HotelFilters.tsx` — 430줄, 3개 컴포넌트 포함
각각 별도 파일로 분리.

### 2-6. `scraper/src/data/mappings.py` — 하드코딩된 매핑 데이터
`HOTEL_KO_MAPPING`, `BRAND_MAPPING`, `CITY_MAPPING` DB 테이블로 이전 필요.

### 2-7. `apps/web/lib/translator.ts` — `CHINESE_TO_KEY` 매핑 중복
단일 소스 오브 트루스 관리 필요.

---

## 3. 확장성 저해 요소

### 3-1. 도시 목록 하드코딩 (4곳에 분산)
`hotels` 테이블에서 동적으로 도시 목록을 가져오는 방식으로 전환.

### 3-2. `daily_rates.room_type` 값의 일관성 부재
레거시 값 정리 필요.

### 3-3. OTA 클라이언트 확장성
`BaseOtaClient` ABC 정의 및 레지스트리 패턴 적용.

### 3-4. 호텔 상세 페이지 월별 랜딩 페이지 미완성

### 3-5. 환율 하드코딩
동적으로 가져오도록 수정.

---

## 4. 에러 처리 및 복원력 문제

### 4-1. `scraper/src/main.py` — 에러 목록 1000개 제한

### 4-2. API Routes — 일관되지 않은 에러 응답

### 4-3. `hotel_sync.py` — 개별 upsert (N+1 문제)
배치 upsert로 변경.

### 4-4. `stats_aggregator.py` — 데이터 압축 시 트랜잭션 미사용

---

## 5. 코드 품질 이슈

### 5-1. `HOTEL_KO_MAPPING`에 중복 키

### 5-2. `DayDetailModal` — `includes('')` 문제

### 5-3. `ErrorBoundary.tsx` — 에러 정보를 로깅하지 않음

### 5-4. ISR Revalidation 시간 불일치

### 5-5. `useMediaQuery` — 미사용 훅

### 5-6. PriceTrendChart — SVG gradient ID 충돌

### 5-7. `MonthGrid` — `useMemo` dependency 누락

---

## 6. 인프라/DevOps 이슈
... (생략) ...

## 7. 우선순위 매트릭스
... (생략) ...
