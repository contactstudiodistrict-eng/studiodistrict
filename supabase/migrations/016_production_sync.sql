-- ============================================================
-- 016_production_sync.sql
-- Safe, idempotent sync for production DB.
-- Every statement uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- so it can be re-run without errors.
-- ============================================================

-- ── 1. USERS ─────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name  text,
  ADD COLUMN IF NOT EXISTS last_name   text,
  ADD COLUMN IF NOT EXISTS referred_by text;

-- ── 2. STUDIO_EQUIPMENT (music / podcast / video columns) ────
ALTER TABLE studio_equipment
  ADD COLUMN IF NOT EXISTS teleprompter       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_monitor      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS condenser_mic      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dynamic_mic        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS broadcast_mic      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pop_filter         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS podcast_mixer      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS headphone_amp      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS acoustic_treatment boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS studio_monitors    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mixing_console     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS daw_computer       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS isolation_booth    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS di_box             boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS instrument_amps    boolean NOT NULL DEFAULT false;

-- ── 3. BANNERS (referral_amount) ─────────────────────────────
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS referral_amount numeric(10,2);

-- ── 4. STUDIO_PACKAGES (create if missing, then add columns) ─
CREATE TABLE IF NOT EXISTS studio_packages (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id           uuid        NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  package_name        text        NOT NULL,
  description         text,
  duration_hours      numeric(4,1) NOT NULL,
  price               numeric(10,2) NOT NULL,
  original_price      numeric(10,2),
  included_equipment  text[]      NOT NULL DEFAULT '{}',
  included_amenities  text[]      NOT NULL DEFAULT '{}',
  included_extras     text[]      NOT NULL DEFAULT '{}',
  max_people          integer,
  rules               text,
  badge_text          text,
  display_order       integer     NOT NULL DEFAULT 0,
  is_active           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- images column added in migration 014 — safe to re-add
ALTER TABLE studio_packages
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

-- ── 5. BOOKINGS (package + referral + wallet + review cols) ───
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS package_id             uuid        REFERENCES studio_packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS package_name           text,
  ADD COLUMN IF NOT EXISTS package_price          numeric(10,2),
  ADD COLUMN IF NOT EXISTS referral_discount      numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wallet_credit_applied  numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_requested_at    timestamptz;

-- ── 6. REFERRAL_CODES (create if missing) ────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code             text        NOT NULL UNIQUE,
  total_referrals  integer     NOT NULL DEFAULT 0,
  total_earned     numeric(10,2) NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 7. REFERRALS (create if missing) ─────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id  uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id  uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code     text        NOT NULL,
  status            text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rewarded')),
  rewarded_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ── 8. WALLET_CREDITS (create if missing) ────────────────────
CREATE TABLE IF NOT EXISTS wallet_credits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      numeric(10,2) NOT NULL,
  type        text        NOT NULL CHECK (type IN ('referral_bonus', 'referral_reward', 'promo', 'manual')),
  description text,
  expires_at  timestamptz,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 9. STUDIO_FAVOURITES (create if missing) ─────────────────
CREATE TABLE IF NOT EXISTS studio_favourites (
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  studio_id   uuid        NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, studio_id)
);

-- ── 10. REVIEWS (create if missing) ──────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  studio_id     uuid        NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        integer     CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  is_verified   boolean     NOT NULL DEFAULT false,
  review_token  text        UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 11. Enable Realtime on new tables (safe to re-run) ───────
ALTER TABLE studio_packages     REPLICA IDENTITY FULL;
ALTER TABLE referral_codes      REPLICA IDENTITY FULL;
ALTER TABLE referrals           REPLICA IDENTITY FULL;
ALTER TABLE wallet_credits      REPLICA IDENTITY FULL;
ALTER TABLE studio_favourites   REPLICA IDENTITY FULL;
ALTER TABLE reviews             REPLICA IDENTITY FULL;
