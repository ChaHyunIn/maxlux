CREATE TABLE monthly_stats (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_id      UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  month         DATE NOT NULL,
  room_type     TEXT DEFAULT 'standard',
  min_price     INTEGER,
  max_price     INTEGER,
  avg_price     INTEGER,
  sample_count  INTEGER,
  UNIQUE (hotel_id, month, room_type)
);
