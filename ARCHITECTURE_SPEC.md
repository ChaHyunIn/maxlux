# MaxLux 프로젝트 아키텍처 상세 명세서
> 마지막 업데이트: 2026-04-13

이 문서는 MaxLux 모노레포의 아키텍처와 각 디렉터리/파일의 목적을 상세히 설명하는 최종 기술 명세서입니다.

---

## 📂 루트 디렉터리 구조

- **`.github/`**: GitHub 통합 및 CI/CD 자동화 설정.
    - `workflows/`: CI(린트, 빌드), CD(Vercel 배포 트리거), 스크래퍼(Cron) 실행 설정.
- **`apps/`**: 웹 애플리케이션 서비스 환경 (Next.js 기반).
- **`scraper/`**: Python 기반의 고성능 데이터 수집 및 분석 엔진.
- **`supabase/`**: PostgreSQL 데이터베이스 스키마 및 마이그레이션 관리.
    - `migrations/`: 001~019번까지의 연쇄 마이그레이션. 테이블 생성, RLS 보안 정책, 실시간 시스템 설정(환율) 히스토리 관리.
- **루트 주요 문서**:
    - `PROJECT_STATUS.md`: 기능별 로드맵 및 현재 진행 상황 추적.
    - `DATABASE_SCHEMA.md`: 상세 테이블 명세 및 관계도.
    - `ARCHITECTURE_SPEC.md`: 본 문서 (아키텍처 가이드).

---

## 🌐 웹 애플리케이션 (`apps/web`)

### `/app` (라우팅 및 프레임워크)
- **`/[locale]/hotels/[slug]/compare`**: [NEW] 월별 가격 비교 SEO 전용 페이지. 12개월 데이터를 분석하여 최적의 투숙 시점 제안.
- **`/[locale]/hotels/[slug]/[yyyy-mm]`**: 월별 히트맵 랜딩 페이지.
- **`api/og/[slug]`**: [NEW] 동적 OG 이미지 생성 API. 호텔별 브랜딩 이미지를 실시간 Satori 렌더링으로 생성.
- **`api/price-alerts`**: 가격 알림 등록(POST), 조회(GET), 해제(DELETE) 엔드포인트.
- **`sitemap.ts`**: 전체 호텔 및 12개월 월간 페이지를 포함한 동적 XML 사이트맵 생성 (Scalability를 위해 언어별/주제별 분할 생성 지원).
- **`robots.ts`**: 검색 엔진 크롤링 정책 정의.
- **`sentry.*.config.ts`**: [NEW] 클라이언트/서버/엣지 런타임별 에러 추적 및 성능 모니터링 설정.

### `/components` (UI/UX 계층)
- **`calendar/`**: 히트맵 엔진.
    - `MonthGrid.tsx`: 개별 월 그리드 렌더링 및 월간 상세 페이지 링크 제공.
    - `DayCell.tsx`: 가격 수준별 색상 표시 및 상호작용.
    - `DayDetailModal.tsx`: 객실별 상세 요금(Room Rates) 및 OTA 비교 정보 표시.
- **`hotel/`**: 호텔 특화 UI.
    - `PriceSummaryCard.tsx`: [NEW] 가격 통계 요약 대시보드 (최저/평균/변동성/요일별 패턴).
    - `MonthlyComparisonChart.tsx`: [NEW] 월별 가격 비교 막대 차트 (Framer Motion 적용).
    - `PriceChangesList.tsx`: 최근 가격 변동 이력 시각회 (Staggered Animation 적용).
    - `PriceTrendChart.tsx`: 기간별 가격 추이 라인 차트.
    - `HotelHeroHeader.tsx`: 호텔 기본 정보 및 고해상도 이미지 표시.

### `/lib` & `/stores` (데이터 및 상태)
- **`rateLimit.ts`**: [NEW] **Upstash Redis** 기반의 전역 분산 요청 제한 로직. 서버리스 환경에서 안전한 API 호출 보장.
- **`supabase/`**: `queries/` (Materialized View 조회), `mutations/` (알림 등록) 분리.
- **`stores/`**: `settingStore.ts`(통화, 필터), `calendarStore.ts` 등 Zustand 기반 전역 상태 관리.
- **`api/currency.ts`**: 실시간 환율 관리 및 `unstable_cache` 적용.
- **`mappers/`**: 가공되지 않은 데이터를 다국어/표준 용어로 치환 (Brand, City, Benefit).

---

## 🕷️ 스크래퍼 엔진 (`scraper`)

### `/src` (핵심 파이프라인)
- **`orchestrator.py`**: 전체 워크플로우 제어 (동기화 → 요금 수집 → 사후 처리).
- **`pipeline/`**: Phase 단위별 실행 로직 (Sync, Collection, Post-Scrape).

### `/src/clients` (외부 시스템 연동)
- **`base_client.py`**: [NEW] 모든 OTA 클라이언트의 공백. 세션 관리, 배치 처리, 공통 예외 처리를 담당하는 추상 클래스.
- **`hotellux.py`**: 메인 데이터 소스 연동 및 비동기 폴링 핸들링.
- **`agoda.py`**, **`booking.py`**: OTA 가격 비교를 위한 전용 크롤러.
- **`supabase_client.py`**: DB 연동 및 PostgREST 인터페이스 래핑.

### `/src/services` (비즈니스 로직)
- **`alert_checker.py`**: [NEW] 가격 하락 감지 엔진. 통화별(KRW, USD) 이메일 템플릿 처리 및 Resend API 발송.
- **`stats_aggregator.py`**: 가격 백분위수(p25, p75) 계산 및 통계 요약.
- **`hotel_sync.py`**: DB 우선 매핑 로직을 통한 호텔 메타데이터 정규화.
- **`exchange_rate_sync.py`**: [NEW] Frankfurter API를 통한 실시간 USD/KRW 환율 동기화 서비스.
- **`tagger.py`**: 주말/공휴일 등 특수 날짜 속성 부여.

---

## 🛠️ 시스템 특징 및 설계 원칙

1. **DB First Mapping**: 하드코딩된 Python 딕셔너리 의존성을 줄이고 DB에 저장된 한국어명을 우선적으로 신뢰하도록 설계.
2. **Atomic Migrations**: 모든 DB 변경 사항은 `supabase/migrations`를 통해 관리되어 환경 간 일관성 보장.
3. **Luxury Aesthetics**: `Playfair Display` serif 폰트와 골드 톤 디자인 시스템을 통한 프리미엄 UX 제공.
4. **Performance optimized**: Materialized Views와 Redis 기반 Rate Limiting을 통해 수천 명의 동시 접속 시에도 안정적인 성능 유지.
5. **SEO First**: 동적 사이트맵, OG 이미지, 월별 상세/비교 페이지 연쇄 구조를 통한 유기적 검색 트래픽 극대화.
6. **Modular OTA Clients**: `BaseClient` 상속 구조를 통해 새로운 예약 사이트 추가가 용이하도록 모듈화.
