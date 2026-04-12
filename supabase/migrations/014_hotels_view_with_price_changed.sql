-- Update view to include recent price change indicator
DROP VIEW IF EXISTS hotels_with_min_price;

CREATE OR REPLACE VIEW hotels_with_min_price AS
SELECT
    h.*,
    (
        SELECT MIN(dr.price_krw)
        FROM daily_rates dr
        WHERE dr.hotel_id = h.id 
          AND dr.is_sold_out = FALSE 
          AND dr.stay_date >= CURRENT_DATE
          AND dr.price_krw > 0
    ) AS min_price,
    (
        SELECT COUNT(*)::INTEGER
        FROM price_changes pc
        WHERE pc.hotel_id = h.id
          AND pc.changed_at >= NOW() - INTERVAL '48 hours'
          AND pc.new_price < pc.old_price
    ) AS recent_drops
FROM hotels h;
