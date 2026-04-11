# MaxLux – 프로젝트 현황 및 로드맵
> 마지막 업데이트: 2026-04-11

## 프로젝트 개요
HotelLux 럭셔리 호텔의 12개월 가격 데이터를 히트맵 캘린더로 시각화하여
최저가 타이밍을 잡을 수 있게 해주는 서비스.

- **프론트엔드**: Next.js 14 (App Router) + Tailwind + shadcn/ui + next-intl
- **백엔드/DB**: Supabase (PostgreSQL + RPC + Views)
- **스크래퍼**: Python 3.11 (httpx + asyncio + supabase-py)
- **배포**: Vercel
- **스크래퍼 호스팅**: GitHub Actions cron

---

## 현재 완료된 것 (Phase 1-4 Core 완료)

### 프론트엔드
- [x] 호텔 리스트 페이지 (카드 그리드, 검색, 브랜드/가격/이름/특가 정렬)
- [x] 호텔 검색/필터 필터 전면 개편 (도시/가격대/즐겨찾기/복합 필터)
- [x] 호텔 상세 페이지 (HotelHeroHeader + HeatmapCalendar)
- [x] 히트맵 캘린더 (월별 그리드, 가격 색상 분류, p25/p75 퍼센타일)
- [x] 스나이퍼 필터 (금/토, 가장 싼 토요일, 연휴 저점)
- [x] 가격 알림 기능 (이메일 발송, KRW/USD 통화 지원, Target Price)
- [x] "최근 가격 변동" 이력 UI (PriceChangesList, 실시간 데이터 연동)
- [x] 가격 추이 라인 차트 (PriceTrendChart)
- [x] i18n 완료 (ko/en, 모든 경로 및 컴포넌트 적용)
- [x] 즐겨찾기, 통화 전환, 언어 전환 기능 완비
- [x] ErrorBoundary + Loading skeletons 최적화

### 스케일링 & SEO (Phase 6 가동 중)
- [x] 동적 OG 이미지 생성 API (/api/og/[slug])
- [x] 월별 전용 랜딩 페이지 ([yyyy-mm] 상세 라운트)
- [x] 사이트맵(sitemap.xml) 및 로봇(robots.txt) 자동 생성
- [x] Supabase RLS 보안 정책 수립 (room_rates, price_alerts 등 전 테이블 적용)

### 스크래퍼 & 백엔드
- [x] HotelLux API 클라이언트 (BaseClient 상속 구조로 리팩토링 완료)
- [x] 상세 객실 수집 및 4-bucket 데이터 압축 (Phase 5)
- [x] OTA 가격 비교 수집 (아고다, 부킹닷컴 연동)
- [x] 가격 변동 알림 엔진 (alert_checker, Resend API 연동)
- [x] 데이터 매핑 DB화 (HOTEL_KO_MAPPING 의존성 제거)
- [x] sold_out 감지 및 stats_aggregator 최적화

---

## Phase 2 – 스크래퍼 완성 & 데이터 안정화 (100% 완료)

| 태스크 | 우선순위 | 상태 | 비고 |
|--------|----------|------|------|
| GitHub Actions cron | 🔴 Critical | ✅ DONE | KST 06:00 자동화 |
| sold_out 감지 | 🔴 Critical | ✅ DONE | |
| 세션 쿠키 headers 적용 | 🟡 Medium | ✅ DONE | 환경변수 기반 세션 관리 |
| 도시 확장 (busan, jeju) | 🟡 Medium | ✅ DONE | |
| 예약 링크(booking URL) 파싱 | 🟡 Medium | ✅ DONE | |
| HOTEL_KO_MAPPING → DB 연동 | 🟢 Low | ✅ DONE | DB 저장된 이름 우선 사용 |
| stats_aggregator | 🟢 Low | ✅ DONE | |
| 공휴일 API 자동화 | 🟢 Low | ✅ DONE | |

---

## Phase 4 – 프론트 UX 고도화 (100% 완료)

| 태스크 | 우선순위 | 상태 | 비고 |
|--------|----------|------|------|
| 필터 전면 개편 | 🔴 Critical | ✅ DONE | |
| 모바일 필터 Sheet | 🔴 Critical | ✅ DONE | |
| DayCell 상세 모달 | 🔴 Critical | ✅ DONE | 객실별 상세 요금 포함 |
| 가격 추이 라인 차트 | 🟡 Medium | ✅ DONE | |
| 가격 알림 기능 | 🟡 Medium | ✅ DONE | 이메일 발송 완료 |
| "최근 가격 변동" 연동 | 🟢 Low | ✅ DONE | price_changes 기반 |

---

## Phase 6 – 배포 & 운영 (진행 중)

| 태스크 | 우선순위 | 상태 | 비고 |
|--------|----------|------|------|
| Supabase RLS 정책 적용 | 🟡 Medium | ✅ DONE | 보안 강화 완료 |
| OG 이미지 API 완성 | 🟢 Low | ✅ DONE | 동적 생성 완료 |
| 월별 랜딩 페이지 구현 | 🟢 Low | ✅ DONE | SEO 강화 |
| Google Search Console + sitemap | 🟢 Low | ✅ DONE | 자동 생성 완료 |
| Vercel 배포 + 환경변수 설정 | 🔴 Critical | TODO | |
| 커스텀 도메인 연결 | 🟡 Medium | TODO | |
| 에러 모니터링 (Sentry) | 🟢 Low | TODO | |

---

## 기술 스택 요약
- **Stack**: Next.js 14, Supabase, Python 3.11, httpx, asyncio
- **Key Features**: Heatmap Calendar, Dynamic OG Generator, Price History tracking, Email Alert Engine
