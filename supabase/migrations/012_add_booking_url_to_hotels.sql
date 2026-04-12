-- Add booking_url column to hotels table
-- Stores the direct reservation link (HotelLux deeplink or fallback URL)
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS booking_url TEXT;
