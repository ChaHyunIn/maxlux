CREATE TABLE hotels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ko         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  hotellux_id     TEXT NOT NULL UNIQUE,
  hotellux_code   TEXT,
  city            TEXT NOT NULL,
  brand           TEXT,
  stars           SMALLINT,
  image_url       TEXT,
  address         TEXT,
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6),
  benefits        JSONB DEFAULT '[]',
  benefit_value_krw INTEGER DEFAULT 0,
  description     TEXT,
  agoda_id        TEXT,
  booking_id      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_slug ON hotels(slug);
