# MaxLux Database Schema Requirements

## 신규 테이블 (이 브랜치에서 필요)

### ota_prices
| Column | Type | Constraint |
|--------|------|-----------|
| id | serial | PK |
| hotel_id | uuid | FK → hotels.id |
| stay_date | date | NOT NULL |
| source | text | NOT NULL (agoda, booking, etc.) |
| price_krw | integer | NOT NULL |
| room_type | text | DEFAULT 'standard' |
| url | text | NULL |
| UNIQUE | | (hotel_id, stay_date, source, room_type) |

### ota_sources
| Column | Type | Constraint |
|--------|------|-----------|
| code | text | PK |
| name_ko | text | |
| name_en | text | |
| logo_url | text | NULL |
| is_active | boolean | DEFAULT true |

### price_alerts
| Column | Type | Constraint |
|--------|------|-----------|
| id | serial | PK |
| hotel_id | uuid | FK → hotels.id |
| email | text | NOT NULL |
| target_price | integer | NOT NULL |
| stay_date_from | date | NULL |
| stay_date_to | date | NULL |
| is_active | boolean | DEFAULT true |
| locale | text | DEFAULT 'ko' |
| triggered_at | timestamptz | NULL |
| created_at | timestamptz | DEFAULT now() |
| UNIQUE | | (hotel_id, email, target_price) |

### monthly_stats
| Column | Type | Constraint |
|--------|------|-----------|
| id | serial | PK |
| hotel_id | uuid | FK → hotels.id |
| month | date | NOT NULL |
| room_type | text | DEFAULT 'standard' |
| min_price | integer | |
| max_price | integer | |
| avg_price | integer | |
| sample_count | integer | |
| UNIQUE | | (hotel_id, month, room_type) |

## 기존 테이블 변경사항

### daily_rates
| Column | Type | Constraint |
|--------|------|-----------|
| room_type | text | 'non_refundable' 또는 'refundable' (기존 'standard'에서 변경) |

## hotels 테이블 신규 컬럼
- `booking_url` text NULL
- `agoda_id` text NULL  
- `booking_id` text NULL
- `latest_scraped_at` timestamptz NULL
- `min_price_refundable` integer NULL

## holidays 테이블 신규 컬럼 (있으면 확인)
- `name_en` text
- `is_substitute` boolean DEFAULT false
- `year` integer

## 뷰 (Views)

### hotels_with_min_price
호텔 리스트 페이지에서 사용하는 뷰. `getHotels()`, `getHotelsByCity()`가 이 뷰를 참조한다.

```sql
CREATE OR REPLACE VIEW hotels_with_min_price AS
SELECT
    h.*,
    dr_min.min_price,
    dr_ref.min_price_refundable
FROM hotels h
LEFT JOIN LATERAL (
    SELECT MIN(price_krw) AS min_price
    FROM daily_rates
    WHERE hotel_id = h.id
      AND is_sold_out = false
      AND price_krw > 0
      AND stay_date >= CURRENT_DATE
      AND room_type = 'non_refundable'
) dr_min ON true
LEFT JOIN LATERAL (
    SELECT MIN(price_krw) AS min_price_refundable
    FROM daily_rates
    WHERE hotel_id = h.id
      AND is_sold_out = false
      AND price_krw > 0
      AND stay_date >= CURRENT_DATE
      AND room_type = 'refundable'
) dr_ref ON true;
```

> **주의**: 이 뷰가 Supabase에 아직 생성되지 않았다면 위 SQL을 실행해야 한다. `latest_scraped_at`, `min_price_refundable` 컬럼이 포함되려면 `hotels` 테이블에 해당 컬럼이 존재해야 한다.

## room_type 값 규칙

`daily_rates.room_type`과 `ota_prices.room_type` 필드는 현재 환불 정책을 구분하는 용도로 사용한다:
- `'non_refundable'` – 취소 불가 가격
- `'refundable'` – 취소 가능 가격
- `'standard'` – 레거시 값 (향후 마이그레이션 대상)

향후 실제 객실 유형(standard/deluxe/suite)을 구분해야 할 경우 별도 `refund_policy` 컬럼 분리를 검토한다.
