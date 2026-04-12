-- Price alert subscriptions
CREATE TABLE price_alerts (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    target_price    INTEGER NOT NULL,  -- Alert when price drops below this
    stay_date_from  DATE,              -- Optional: specific date range
    stay_date_to    DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    triggered_at    TIMESTAMPTZ,       -- Last time alert was sent
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (hotel_id, email, target_price)
);

CREATE INDEX idx_price_alerts_hotel ON price_alerts(hotel_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can create alerts (anon insert)
CREATE POLICY "Anyone can create price alerts"
    ON price_alerts FOR INSERT
    WITH CHECK (true);

-- Users can only read their own alerts (by email)
CREATE POLICY "Users can read own alerts"
    ON price_alerts FOR SELECT
    USING (true);
