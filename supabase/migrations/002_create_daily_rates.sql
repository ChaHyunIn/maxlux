CREATE TABLE daily_rates (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  stay_date   DATE NOT NULL,
  price_krw   INTEGER NOT NULL,
  room_type   TEXT DEFAULT 'standard',
  tag         TEXT NOT NULL CHECK (tag IN ('SAT','FRI_EVE','HOL','SUN','WEEKDAY')),
  is_sold_out BOOLEAN DEFAULT FALSE,
  scraped_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (hotel_id, stay_date, room_type)
);

CREATE INDEX idx_daily_rates_hotel_date ON daily_rates(hotel_id, stay_date);
CREATE INDEX idx_daily_rates_tag ON daily_rates(tag);
