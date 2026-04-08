CREATE TABLE price_changes (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  stay_date   DATE NOT NULL,
  room_type   TEXT DEFAULT 'standard',
  source      TEXT DEFAULT 'hotellux',
  old_price   INTEGER,
  new_price   INTEGER NOT NULL,
  changed_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_price_changes_hotel ON price_changes(hotel_id, stay_date);
