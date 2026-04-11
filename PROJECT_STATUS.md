# MaxLux – 프로젝트 현황 및 로드맵
> 마지막 업데이트: 2026-04-13

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
