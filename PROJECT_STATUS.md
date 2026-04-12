# MaxLux – 프로젝트 현황 및 로드맵
> 마지막 업데이트: 2026-04-12

## 프로젝트 개요
HotelLux 럭셔리 호텔의 12개월 가격 데이터를 히트맵 캘린더로 시각화하여
최저가 타이밍을 잡을 수 있게 해주는 서비스.

- **프론트엔드**: Next.js 14 (App Router) + Tailwind + shadcn/ui + next-intl + motion
- **백엔드/DB**: Supabase (Materialized Views) + Upstash Redis (Rate Limit)
- **스크래퍼**: Python 3.11 (httpx + asyncio + supabase-py)
- **배포**: Vercel
- **스크래퍼 호스팅**: GitHub Actions cron

---

## 현재 완료된 것 (Phase 1-8 전 구간 완료)

### 프론트엔드
- [x] 호텔 리스트 페이지 (카드 그리드, 검색, 브랜드/가격/이름/특가 정렬)
- [x] 호텔 검색/필터 필터 전면 개편 (도시/가격대/즐겨찾기/복합 필터)
- [x] 호텔 상세 페이지 (HotelHeroHeader + HeatmapCalendar)
- [x] **PriceSummaryCard**: 최저가, 평균가, 주간 패턴 통계 요약 대시보드
- [x] **월별 비교 SEO 페이지**: 호텔별 12개월 가격 비교 분석 및 차트
- [x] **럭셔리 디자인**: Playfair Display 서체 적용 및 모던 브랜드 컬러 시스템
- [x] **마이크로 인터랙션**: 리스트 애니메이션(Motion) 및 최저가 강조(Price Glow)
- [x] 히트맵 캘린더 (월별 그리드, 가격 색상 분류, p25/p75 퍼센타일)
- [x] 스나이퍼 필터 (금/토, 가장 싼 토요일, 연휴 저점)
- [x] 가격 알림 기능 및 관리 UI(Self-management) 구현
- [x] 모바일 UI/접근성: 44px+ 터치 타겟, 색각 이상자용 패턴 인디케이터
- [x] i18n 완료 (ko/en, 모든 경로 및 컴포넌트 적용)
- [x] ErrorBoundary + Sentry 통합 에러 추적

### 백엔드 & 인프라 (고성능 최적화 완료)
- [x] **Upstash Redis 연동**: 서버리스 분산 환경에서도 정확한 전역 요청 제한(Rate Limit) 구현
- [x] **Materialized View 전환**: `hotels_with_min_price` 성능 최적화 (Concurrent Refresh)
- [x] **통합 에러 핸들링**: 전 쿼리 계층 Sentry Exception Reporting 연동
- [x] **비즈니스 분석**: Vercel Analytics 기반 사용자 행동 트래킹 레이어 구축
- [x] **실시간 환율 동기화 및 1시간 단위 캐싱 (`unstable_cache`)**
- [x] **Supabase RLS 보안 강화 및 `system_settings` 변조 방지**

---

<details>
<summary>Phase 6~7 이력 (아카이브)</summary>

## Phase 6 – 배포 & 운영 (100% 완료)

| 태스크 | 상태 | 비고 |
|--------|------|------|
| Supabase RLS 정책 적용 | ✅ | 보안 강화 완료 |
| OG 이미지 API 완성 | ✅ | 동적 생성 완료 |
| 월별 랜딩 페이지 구현 | ✅ | SEO 강화 |
| Google Search Console + sitemap | ✅ | 자동 생성 완료 |
| Vercel 배포 + 환경변수 설정 | ✅ | Production 기동 완료 |
| 에러 모니터링 (Sentry) | ✅ | 실시간 에러 추적 활성화 |

## Phase 7 – 시스템 고도화 (100% 완료)

| 태스크 | 상태 | 비고 |
|--------|------|------|
| 에러 핸들링 통일 (Sentry) | ✅ | Batch #1 |
| 비즈니스 이벤트 추적 | ✅ | Batch #2 (Analytics) |
| Hero 섹션 & 온보딩 | ✅ | Batch #3 |
| 모바일 UI & 접근성 | ✅ | Batch #4 (Patterns) |
| 알림 관리 UI | ✅ | Batch #5 |
| DB 성능 최적화 (MV) | ✅ | Batch #6 |

</details>

---

## Phase 8 – 프로덕션 최적화 (UX & SEO) (100% 완료)

| 태스크 | 우선순위 | 상태 | 비고 |
|--------|----------|------|------|
| Upstash Redis Rate Limiter | 🔴 Critical | ✅ DONE | Batch A (Stability) |
| PriceSummaryCard 구현 | 🟡 Medium | ✅ DONE | Batch A (Insights) |
| 디자인 토큰 & 애니메이션 | 🟡 Medium | ✅ DONE | Batch B (Luxury UI) |
| 월별 비교 SEO 페이지 | 🔴 Critical | ✅ DONE | Batch C (SEO Expansion) |
| 사이트맵 & 내부 링크 강화 | 🟡 Medium | ✅ DONE | Batch C (Navigation) |

---

## 기술 스택 요약
- **Stack**: Next.js 14, Supabase (MV), Python 3.11, Upstash Redis, Sentry
- **Key Features**: Heatmap Calendar, Monthly Comparison Dashboard, Price Summary Stats, Animation-rich UI
