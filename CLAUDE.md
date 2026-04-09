# MaxLux 코드 규칙

## 절대 금지
- `as TypeName` 타입 캐스팅 사용 (`as const`는 허용)
- `any` 타입 사용
- `!` non-null assertion 사용
- `console.log` 커밋 (디버깅 후 반드시 제거)
- `venv/`, `node_modules/`, `.env*` 파일 커밋
- 빈 문자열을 이용한 `includes('')` 체크
- JSX 내부에서 IIFE `(() => { ... })()` 사용
- 유저에게 보이는 문자열 하드코딩 (반드시 i18n 키 사용)
- 매퍼/맵 함수에서 매칭 실패 시 임의 기본값 반환 (매칭 실패 시 `null` 반환)

## 필수 규칙
- 새로운 상수/매핑 추가 시 해당 타입 정의를 동시에 업데이트할 것
- 새로운 UI 문자열 추가 시 `ko.json`, `en.json` 동시에 업데이트할 것
- 2개 이상의 컴포넌트에서 사용되는 로직은 `hooks/` 또는 `lib/`로 추출할 것
- 모든 커밋 전 `npx eslint . --max-warnings=0`, `npx tsc --noEmit`, `npm run build` 통과 확인

## 빌드 검증 명령어
```bash
cd apps/web
npx eslint . --max-warnings=0
npx tsc --noEmit
npm run build
```
