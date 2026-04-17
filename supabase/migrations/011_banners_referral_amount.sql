-- Migration 011: add referral_amount to banners + allow 'referral' type
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS referral_amount integer DEFAULT 200;
