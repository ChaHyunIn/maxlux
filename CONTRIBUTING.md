# MaxLux 코딩 컨벤션

## 상수 (Constants)
- 모든 숫자/문자열 매직값은 `lib/constants.ts`에 정의
- 컴포넌트 파일에 직접 숫자 리터럴 사용 금지
- `as const`를 모든 상수 객체에 적용
- localStorage 키는 `STORAGE_KEYS`를 통해서만 접근

## 중복 정의 금지
- 동일한 이름의 export를 두 파일 이상에서 정의하지 않음
- 한 곳에서 정의하고, 나머지는 re-export

## i18n
- 새 번역 키 추가 시 `ko.json`과 `en.json` 모두에 동시 추가
- pre-commit hook이 키 불일치를 자동 감지
- 컴포넌트에 한국어/영어 문자열 직접 사용 금지

## 호텔 이름 표시
- 항상 `getHotelName(hotel, locale)` 사용
- `hotel.name_ko` 또는 `hotel.name_en` 직접 접근 금지

## 가격 포맷팅
- 항상 `formatPrice(price, currency)` 사용
- 만원 단위 변환: `LOCALE_DEFAULTS.priceUnitManDivisor`
- `toLocaleString()` 직접 호출 금지

## React Hooks
- `useCallback`/`useMemo` 안에서 외부 변수 이름과 동일한 콜백 파라미터 금지
- `useEffect` 의존성 배열 빠뜨리지 않기 (exhaustive-deps)

## Python (scraper)
- `datetime.utcnow()` 사용 금지 → `datetime.now(timezone.utc)` 사용
- 모든 `except` 블록에 최소한 로깅 포함
- import 순서는 `ruff` isort가 강제
