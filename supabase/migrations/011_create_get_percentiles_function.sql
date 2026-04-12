-- RPC function to calculate price percentiles (p25, p75) for a hotel
CREATE OR REPLACE FUNCTION get_percentiles(hotel_uuid UUID)
RETURNS JSON AS $$
DECLARE
  p25_value INTEGER;
  p75_value INTEGER;
BEGIN
  -- Calculate p25 (25th percentile)
  SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY price_krw)::INTEGER
  INTO p25_value
  FROM daily_rates
  WHERE hotel_id = hotel_uuid
    AND is_sold_out = FALSE
    AND stay_date >= CURRENT_DATE
    AND price_krw > 0;

  -- Calculate p75 (75th percentile)
  SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY price_krw)::INTEGER
  INTO p75_value
  FROM daily_rates
  WHERE hotel_id = hotel_uuid
    AND is_sold_out = FALSE
    AND stay_date >= CURRENT_DATE
    AND price_krw > 0;

  -- Return as JSON
  RETURN json_build_object(
    'p25', COALESCE(p25_value, 300000),
    'p75', COALESCE(p75_value, 600000)
  );
END;
$$ LANGUAGE plpgsql STABLE;
