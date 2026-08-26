-- Add package, referral, and wallet columns to bookings table
-- These were added to the API but never migrated to production

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS package_id         uuid        REFERENCES studio_packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS package_name       text,
  ADD COLUMN IF NOT EXISTS package_price      numeric(10,2),
  ADD COLUMN IF NOT EXISTS referral_discount  numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wallet_credit_applied numeric(10,2) NOT NULL DEFAULT 0;
