# Web Application Testing

이 디렉토리는 `Next.js` 프론트엔드의 검증을 위한 가이드를 포함합니다.

## Linting & Type Check
코드 스타일과 타입 안정성을 검사합니다.
```bash
# Lint 체크
npm run lint

# 타입 체크
npx tsc --noEmit
```

## Unit Testing (Future)
현재 단위 테스트 환경은 구축 중입니다. 향후 `Jest` 또는 `Vitest`를 도입할 예정입니다.
- TODO: `components/` 단위 테스트 코드 작성
- TODO: `lib/utils.ts` 유틸리티 함수 테스트 작성

## CI/CD
Vercel 배포 시 자동으로 빌드 및 린트 검사가 수행됩니다.
