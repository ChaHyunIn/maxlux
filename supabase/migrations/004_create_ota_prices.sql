CREATE TABLE ota_prices (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  stay_date   DATE NOT NULL,
  source      TEXT NOT NULL REFERENCES ota_sources(code),
  price_krw   INTEGER NOT NULL,
  room_type   TEXT DEFAULT 'standard',
  url         TEXT,
  scraped_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (hotel_id, stay_date, source, room_type)
);

CREATE INDEX idx_ota_prices_hotel_date ON ota_prices(hotel_id, stay_date);
CREATE INDEX idx_ota_prices_source ON ota_prices(source);
