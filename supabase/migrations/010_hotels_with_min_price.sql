-- Drop the view if it exists
DROP VIEW IF EXISTS hotels_with_min_price;

-- Create the view
CREATE OR REPLACE VIEW hotels_with_min_price AS
SELECT
    h.*,
    (
        SELECT MIN(dr.price_krw)
        FROM daily_rates dr
        WHERE dr.hotel_id = h.id 
          AND dr.is_sold_out = FALSE 
          AND dr.stay_date >= CURRENT_DATE
    ) AS min_price
FROM hotels h;
