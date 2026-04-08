# MaxLux

럭셔리 호텔 최저가 스나이퍼. HotelLux 호텔의 12개월 가격을 히트맵 캘린더로 보여줍니다.

## 구조
- `apps/web` - Next.js 14 프론트엔드
- `scraper` - Python 가격 수집 크롤러
- `supabase` - DB 마이그레이션 SQL

## 실행
### 프론트엔드
```bash
cd apps/web && npm install && npm run dev
```

### 크롤러
```bash
cd scraper && pip install -r requirements.txt && python -m src.main
```
