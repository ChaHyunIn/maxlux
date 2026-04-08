CREATE TABLE scrape_logs (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id          TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  finished_at     TIMESTAMPTZ,
  hotels_count    INTEGER,
  rates_inserted  INTEGER,
  rates_updated   INTEGER,
  errors          JSONB DEFAULT '[]',
  status          TEXT CHECK (status IN ('running','success','partial','failed'))
);
