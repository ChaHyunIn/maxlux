# MaxLux – 프로젝트 현황 및 로드맵
> 마지막 업데이트: 2026-04-09

## 프로젝트 개요
HotelLux 럭셔리 호텔의 12개월 가격 데이터를 히트맵 캘린더로 시각화하여
최저가 타이밍을 잡을 수 있게 해주는 서비스.

- **프론트엔드**: Next.js 14 (App Router) + Tailwind + shadcn/ui + next-intl
- **백엔드/DB**: Supabase (PostgreSQL + RPC + Views)
- **스크래퍼**: Python 3.11 (httpx + asyncio + supabase-py)
- **배포**: Vercel (예정)
- **스크래퍼 호스팅**: GitHub Actions cron (예정)

---

## 현재 완료된 것 (Phase 1 Core)

### 프론트엔드
- [x] 호텔 리스트 페이지 (카드 그리드, 검색, 브랜드/가격/이름/특가 정렬)
- [x] 호텔 상세 페이지 (HotelHeroHeader + HeatmapCalendar)
- [x] 히트맵 캘린더 (월별 그리드, 가격 색상 분류, p25/p75 퍼센타일)
- [x] 스나이퍼 필터 (금/토, 가장 싼 토요일, 연휴 저점)
- [x] 캘린더 범례 (저렴/보통/비쌈/매진)
- [x] i18n 완료 (ko/en, next-intl, locale prefix as-needed)
- [x] 모든 UI 텍스트 messages/ko.json + en.json으로 중앙화
- [x] locale-aware cityMapper, benefitMapper
- [x] locale별 generateMetadata (SEO)
- [x] 즐겨찾기 (Heart 버튼, localStorage)
- [x] 특가 뱃지 (HOT_DEAL_THRESHOLD 상수화)
- [x] 가격 알림 버튼 (UI만, 기능 TODO)
- [x] 통화 전환 (KRW/USD, settingStore)
- [x] 언어 전환 (HeaderActions, URL prefix 변경)
- [x] ErrorBoundary + ErrorFallback + Loading skeletons
- [x] next/image 최적화 + 이미지 에러 fallback
- [x] Vercel Analytics 연동
- [x] Pretendard 폰트

### 스크래퍼
- [x] HotelLux API 클라이언트 (async polling, 페이지네이션, 재시도)
- [x] 호텔 정보 sync (upsert, 한국어 매핑, 브랜드 매핑, 슬러그 생성)
- [x] 일일 가격 수집 (90일, daily_rates upsert)
- [x] 날짜 태깅 (WEEKDAY/FRI_EVE/SAT/SUN/HOL)
- [x] 공휴일 시드 (2026년)
- [x] CDC 가격 변동 기록 (price_changes 테이블)
- [x] scrape_logs 실행 이력
- [x] structlog 기반 로깅
- [x] 동시성 제어 (semaphore 5)

### 인프라/보안
- [x] .env 파일 전부 .gitignore 처리
- [x] sample_resp.json 삭제
- [x] next_log.txt .gitignore 추가
- [x] .env.example 파일 제공

---

## Phase 2 – 스크래퍼 완성 & 데이터 안정화

| 태스크 | 우선순위 | 예상 시간 | 상태 |
|--------|----------|-----------|------|
| GitHub Actions cron (매일 KST 06:00) | 🔴 Critical | 1시간 | ✅ DONE |
| sold_out 감지 (price null → is_sold_out: true) | 🔴 Critical | 30분 | ✅ DONE |
| 세션 쿠키 headers 적용 (필요 시) | 🟡 Medium | 15분 | TODO |
| 도시 확장 (busan, jeju) | 🟡 Medium | 1시간 | ✅ DONE |
| 예약 링크(booking URL) 파싱 & 저장 | 🟡 Medium | 1시간 | ✅ DONE |
| HOTEL_KO_MAPPING → DB 마이그레이션 | 🟢 Low | 2시간 | TODO |
| stats_aggregator (오래된 데이터 압축) | 🟢 Low | 2시간 | ✅ DONE |
| 공휴일 API 자동화 (공공데이터포털) | 🟢 Low | 2시간 | ✅ DONE |

---

## Phase 3 – OTA 가격 비교

| 태스크 | 우선순위 | 예상 시간 | 상태 |
|--------|----------|-----------|------|
| 아고다 가격 스크래핑 클라이언트 | 🔴 Critical | 4시간 | ✅ DONE |
| 부킹닷컴 가격 스크래핑 클라이언트 | 🔴 Critical | 4시간 | ✅ DONE |
| ota_prices 테이블 설계 & 마이그레이션 | 🟡 Medium | 1시간 | ✅ DONE |
| OTA 가격 수집 → rate_collector 통합 | 🟡 Medium | 2시간 | ✅ DONE |
| 프론트: DayCell 클릭 → OTA 비교 모달 | 🟡 Medium | 3시간 | ✅ DONE |
| 프론트: 예약 링크 연결 (HotelLux + OTA) | 🟡 Medium | 2시간 | ✅ DONE |

---

## Phase 4 – 프론트 UX 고도화

| 태스크 | 우선순위 | 예상 시간 | 상태 |
|--------|----------|-----------|------|
| 필터 전면 개편 (도시/가격대/즐겨찾기/복합 필터) | 🔴 Critical | 4시간 | ✅ DONE |
| 모바일 필터 Sheet | 🔴 Critical | 2시간 | ✅ DONE |
| DayCell 클릭 상세 모달 (룸타입, OTA 비교, 예약링크) | 🔴 Critical | 3시간 | ✅ DONE |
| 검색 자동완성 드롭다운 | 🟡 Medium | 2시간 | ✅ DONE |
| 가격 추이 라인 차트 | 🟡 Medium | 3시간 | ✅ DONE |
| 가격 알림 기능 (이메일 또는 Push) | 🟡 Medium | 4시간 | ✅ DONE |
| 즐겨찾기만 보기 필터 | 🟢 Low | 30분 | ✅ DONE |
| "최근 가격 변동" 실제 데이터 연동 (price_changes) | 🟢 Low | 2시간 | TODO |

---

## Room-Level Rate Collection (Phase 5)
- ✅ HotelLux detail rates API integration (`get_hotel_rates`)
- ✅ Rate parser (`rate_parser.py`) – all room × rate plan extraction
- ✅ `room_rates` table schema with full columns
- ✅ 4-bucket daily_rates aggregation (nr_nobf, nr_bf, r_nobf, r_bf)
- ✅ Pipeline Phase A (city sync) + Phase B (detail scraping)
- ✅ Frontend: RoomRate interface, API route, DayDetailModal UI
- ✅ i18n keys for room rates section

---

## Phase 6 – 배포 & 운영

| 태스크 | 우선순위 | 예상 시간 | 상태 |
|--------|----------|-----------|------|
| Vercel 배포 + 환경변수 설정 | 🔴 Critical | 1시간 | TODO |
| 커스텀 도메인 연결 | 🟡 Medium | 30분 | TODO |
| Supabase 프로덕션 보안 (RLS 정책) | 🟡 Medium | 2시간 | TODO |
| OG 이미지 API 완성 (/api/og/[slug]) | 🟢 Low | 2시간 | TODO |
| SEO 월별 랜딩 페이지 ([yyyy-mm]) | 🟢 Low | 2시간 | TODO |
| Google Search Console + sitemap.xml | 🟢 Low | 1시간 | TODO |
| 에러 모니터링 (Sentry) | 🟢 Low | 1시간 | TODO |
| 어필리에이트 수익화 구조 | 🟢 Low | 별도 | TODO |

---

## DB 테이블 구조 (현재)

| 테이블 | 설명 |
|--------|------|
| hotels | 호텔 마스터 (hotellux_id, name_ko/en, slug, city, brand, benefits 등) |
| hotels_with_min_price | View – hotels + daily_rates 최저가 조인 |
| daily_rates | 일별 가격 (hotel_id, stay_date, price_krw, room_type, tag, is_sold_out) |
| price_changes | CDC 가격 변동 이력 (old_price → new_price) |
| holidays | 공휴일 (date, name_ko/en, year) |
| scrape_logs | 스크래퍼 실행 이력 (run_id, status, inserted/updated, errors) |
| ota_prices | OTA 가격 비교 (Phase 3에서 생성 예정) |

---

## 기술 스택 요약

