# CLAUDE.md – AI 에이전트 컨텍스트

## 프로젝트
MaxLux – 럭셔리 호텔 가격 비교 히트맵 캘린더 서비스

## 모노레포 구조
- `apps/web/` – Next.js 14 프론트엔드 (TypeScript, Tailwind, shadcn/ui, next-intl)
- `scraper/` – Python 3.11 스크래퍼 (httpx, asyncio, supabase-py)

## 핵심 규칙
- 모든 UI 텍스트는 `messages/ko.json` + `messages/en.json`에 정의. 하드코딩 금지.
- 컴포넌트에서 `useTranslations()` 사용. 서버 컴포넌트에서는 `getTranslations()`.
- `next/link` 대신 `@/i18n/navigation`의 `Link` 사용.
- `next/navigation`의 `redirect` 대신 `@/i18n/navigation`의 `redirect` 사용 (단, locale prefix 자동 처리되는 경우 next/navigation도 가능).
- 클라이언트 컴포넌트에는 반드시 `'use client'` 선언.
- 가격 포맷은 `lib/utils.ts`의 `formatPrice()` 사용. 직접 포맷 금지.
- 매직넘버는 `lib/constants.ts`에 정의.
- DB 접근은 `lib/supabase/server.ts`의 함수만 사용.
- API 라우트는 `app/api/`에 위치 (i18n 영향 없음).

## 빌드 & 실행
```bash
# 프론트
cd apps/web && npm install && npm run dev
# http://localhost:3000 (ko), http://localhost:3000/en (en)

# 스크래퍼
cd scraper && pip install -r requirements.txt
python -m src.main
