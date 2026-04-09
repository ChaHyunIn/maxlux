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

## hotels 테이블 신규 컬럼
- `booking_url` text NULL
- `agoda_id` text NULL  
- `booking_id` text NULL

## holidays 테이블 신규 컬럼 (있으면 확인)
- `name_en` text
- `is_substitute` boolean DEFAULT false
- `year` integer
