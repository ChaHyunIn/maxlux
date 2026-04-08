-- Enable RLS
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stats ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon key)
CREATE POLICY "Public read hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Public read daily_rates" ON daily_rates FOR SELECT USING (true);
CREATE POLICY "Public read ota_sources" ON ota_sources FOR SELECT USING (true);
CREATE POLICY "Public read ota_prices" ON ota_prices FOR SELECT USING (true);
CREATE POLICY "Public read holidays" ON holidays FOR SELECT USING (true);
CREATE POLICY "Public read monthly_stats" ON monthly_stats FOR SELECT USING (true);

-- price_changes, scrape_logs: 내부 전용 (service_role key만 접근)
