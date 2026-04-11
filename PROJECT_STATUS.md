# MaxLux – 프로젝트 현황 및 로드맵
> 마지막 업데이트: 2026-04-12

## 프로젝트 개요
HotelLux 럭셔리 호텔의 12개월 가격 데이터를 히트맵 캘린더로 시각화하여
최저가 타이밍을 잡을 수 있게 해주는 서비스.

- **프론트엔드**: Next.js 14 (App Router) + Tailwind + shadcn/ui + next-intl
- **백엔드/DB**: Supabase (PostgreSQL + RPC + Views + Materialized Views)
- **스크래퍼**: Python 3.11 (httpx + asyncio + supabase-py)
- **배포**: Vercel
- **스크래퍼 호스팅**: GitHub Actions cron

---

## 현재 완료된 것 (Phase 1-7 전 구간 완료)

### 프론트엔드
- [x] 호텔 리스트 페이지 (카드 그리드, 검색, 브랜드/가격/이름/특가 정렬)
- [x] 호텔 검색/필터 필터 전면 개편 (도시/가격대/즐겨찾기/복합 필터)
- [x] 호텔 상세 페이지 (HotelHeroHeader + HeatmapCalendar)
- [x] 히트맵 캘린더 (월별 그리드, 가격 색상 분류, p25/p75 퍼센타일)
- [x] 스나이퍼 필터 (금/토, 가장 싼 토요일, 연휴 저점)
- [x] 가격 알림 기능 및 **관리 UI(Self-management)** 구현
- [x] **Hero 섹션 & 온보딩**: 첫 방문자 가치 제안 UI (Adaptive Layout)
- [x] **모바일 UI/접근성**: 44px+ 터치 타겟, 색각 이상자용 비색상(Pattern) 기반 인디케이터
- [x] i18n 완료 (ko/en, 모든 경로 및 컴포넌트 적용)
- [x] ErrorBoundary + Sentry 통합 에러 추적

### 백엔드 & 인프라 (고성능 최적화 완료)
- [x] **Materialized View 전환**: `hotels_with_min_price` 성능 최적화 (Concurrent Refresh)
- [x] **통합 에러 핸들링**: 전 쿼리 계층 Sentry Exception Reporting 연동
- [x] **비즈니스 분석**: Vercel Analytics 기반 사용자 행동 트래킹 레이어 구축
- [x] 실시간 환율 동기화 및 1시간 단위 캐싱 (`unstable_cache`)
- [x] Supabase RLS 보안 강화 및 `system_settings` 변조 방지

---

## Phase 6 – 배포 & 운영 (100% 완료)

| 태스크 | 우선순위 | 상태 | 비고 |
|--------|----------|------|------|
| Supabase RLS 정책 적용 | 🟡 Medium | ✅ DONE | 보안 강화 완료 |
| OG 이미지 API 완성 | 🟢 Low | ✅ DONE | 동적 생성 완료 |
| 월별 랜딩 페이지 구현 | 🟢 Low | ✅ DONE | SEO 강화 |
| Google Search Console + sitemap | 🟢 Low | ✅ DONE | 자동 생성 완료 |
| Vercel 배포 + 환경변수 설정 | 🔴 Critical | ✅ DONE | Production 기동 완료 |
| 에러 모니터링 (Sentry) | 🟢 Low | ✅ DONE | 실시간 에러 추적 활성화 |

---

## Phase 7 – 시스템 고도화 (100% 완료)

| 태스크 | 우선순위 | 상태 | 비고 |
|--------|----------|------|------|
| 에러 핸들링 통일 (Sentry) | 🔴 Critical | ✅ DONE | Batch #1 |
| 비즈니스 이벤트 추적 | 🟡 Medium | ✅ DONE | Batch #2 (Analytics) |
| Hero 섹션 & 온보딩 | 🟡 Medium | ✅ DONE | Batch #3 |
| 모바일 UI & 접근성 | 🟢 Low | ✅ DONE | Batch #4 (Patterns) |
| 알림 관리 UI | 🟡 Medium | ✅ DONE | Batch #5 |
| DB 성능 최적화 (MV) | 🔴 Critical | ✅ DONE | Batch #6 |

---

## 기술 스택 요약
- **Stack**: Next.js 14, Supabase (MV), Python 3.11, Vercel Analytics, Sentry
- **Key Features**: Heatmap Calendar, Self-managed Price Alert, Adaptive Hero UI, Accessible Patterns
