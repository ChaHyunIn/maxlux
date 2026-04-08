CREATE TABLE ota_sources (
  code              TEXT PRIMARY KEY,
  name_ko           TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  logo_url          TEXT,
  affiliate_base_url TEXT,
  commission_rate   NUMERIC(5,2),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

INSERT INTO ota_sources (code, name_ko, name_en) VALUES
  ('agoda',      '아고다',       'Agoda'),
  ('booking',    '부킹닷컴',     'Booking.com'),
  ('hotels_com', '호텔스닷컴',   'Hotels.com'),
  ('trip_com',   '트립닷컴',     'Trip.com'),
  ('expedia',    '익스피디아',   'Expedia'),
  ('hotellux',   '호텔럭스',     'HotelLux');
