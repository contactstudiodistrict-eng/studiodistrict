# Studio District — Chennai Studio Booking Platform
## Claude Code Project Context

> This file gives Claude Code full context of the project.
> Read this FIRST before making any changes.

---

## What this project is

A mobile-first studio rental marketplace for Chennai — like Peerspace.com but for
photo, video, podcast, and music studios. Built by Arjun (IT professional + photographer).

**Live URLs:**
- Production: https://studiodistrict.in
- Local dev: http://localhost:3000
- Admin: http://localhost:3000/admin (prod: https://studiodistrict.in/admin)
- Owner dashboard: http://localhost:3000/studio/dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router + TailwindCSS |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| WhatsApp | Twilio WhatsApp Sandbox |
| Payments | Razorpay (integrated — credentials pending from Arjun) |
| Images | Cloudinary (upload zones built — keys pending) |
| Maps | Google Maps (not yet configured) |
| Email | Resend (custom SMTP, API key configured) |
| Deployment | Vercel → studiodistrict.in (live) |

---

## Supabase Project

```
Project ID:   khtzyxyqurkakdzsvhza
URL:          https://khtzyxyqurkakdzsvhza.supabase.co
Anon Key:     (see .env.local — NEXT_PUBLIC_SUPABASE_ANON_KEY)
Service Role: (see .env.local — SUPABASE_SERVICE_ROLE_KEY)
```

**Migrations applied (13):**
- 001_enable_extensions
- 002_users_table (+ auth trigger)
- 003_studios_table
- 004_studio_details_tables
- 005_bookings_table (+ booking_ref trigger)
- 006_payments_payouts_admin_audit
- 007_rls_policies
- 008_seed_studios (3 live studios)
- 009_disable_email_confirmation_for_testing
- 010_fix_realtime_replica_identity (REPLICA IDENTITY FULL)
- 011_banners_referral_amount (referral_amount column on banners)
- 012_users_first_last_name (first_name, last_name columns on users)
- 013_studio_equipment_type_fields (15 new boolean columns on studio_equipment for music/podcast/video)

**17 tables:** users, studios, studio_images, studio_amenities, studio_equipment,
studio_packages, bookings, payments, payouts, admin_users, audit_logs,
banners, referral_codes, referrals, wallet_credits, studio_favourites, reviews

---

## Twilio WhatsApp

```
Account SID:  (see .env.local — TWILIO_ACCOUNT_SID)
Auth Token:   (see .env.local — TWILIO_AUTH_TOKEN)
From:         whatsapp:+14155238886  (Twilio sandbox)
Test number:  whatsapp:+919994390035
```

**Important:** Twilio Sandbox requires every number to join first.
Each number sends "join <keyword>" to +1 415 523 8886.

**Webhook URL (local):**
Set in Twilio Console → WhatsApp Sandbox Settings:
`https://<cloudflare-tunnel>.trycloudflare.com/api/twilio/webhook`

Tunnel command: `npx cloudflared tunnel --url http://localhost:3000`

---

## Seed Data (live in Supabase)

| Studio | Area | Price | Status |
|---|---|---|---|
| Lumière Studio Co. | Velachery | ₹1,200/hr | live |
| SoundBox OMR | OMR | ₹800/hr | live |
| Frame & Co. Studios | Anna Nagar | ₹1,500/hr | live |

**Owner of Lumière:** contact.studio.district@gmail.com
**Admin user:** contact.studio.district@gmail.com (super_admin)

---

## Current User

```
Email:  contact.studio.district@gmail.com
Role:   admin
ID:     d6568998-2025-4dee-9280-8f347caf7487
```

---

## What's Working ✅

### Core Booking Flow
- Homepage + studio discovery with filters (type, area, price, amenity, sort)
- Studio profile page (amenities, equipment, pricing, rules, image gallery)
- 3-step booking form (date/time → details → review)
- Booking created → WhatsApp notification to studio owner
- Studio replies YES → customer gets payment link via WhatsApp
- Studio replies NO → customer gets decline notification
- Booking status page with Supabase Realtime (+ 10s polling fallback)
- Studio contact details hidden until booking.status = 'paid' or 'completed'
- Rebook: "Book again" shortcut from homepage/dashboard, pre-fills form

### Auth
- Login: Email OTP (6-digit code, no magic link) + Google OAuth
- Auth-aware header (shows name, role badge, wallet balance, dropdown)
- Profile completion modal: shown on every session until first_name/last_name filled

### Studio Packages ⭐
- `studio_packages` table: name, description, duration_hours, price, original_price, included_equipment/amenities/extras, max_people, rules, badge_text, display_order, is_active
- Package cards on studio profile (above amenities) with badges (Most Popular, Best Value, Premium, New), savings pill, included items checklist
- Booking form package mode: `?package=id` URL param locks duration, shows flat pricing
- Pricing snapshot: `package_id`, `package_name`, `package_price` stored on booking at creation (immutable)
- Package pricing: subtotal = package price (not hourly × hours); platform_fee/GST still apply
- Owner dashboard: full CRUD — add/edit/deactivate/reactivate via modal
- WhatsApp owner notification includes package name when applicable
- Homepage studio cards show "📦 X packages from ₹Y" pill
- Booking status page shows package name in payment summary

### Studio Onboarding (10-step wizard at /studio/onboard or /studio/list)
- Step 1: Basic info (name, type, owner, phone, area, address, Maps link)
- Step 2: Pricing (hourly rate, min hours, half/full-day rates) + **type-specific extra charges**:
  - Photo/Video: lighting tech, camera rental, backdrop change, overtime
  - Podcast/Audio: sound engineer, editing session, overtime
  - Music: studio engineer, instrument hire, mix & master, overtime
  - Multi-use: lighting tech, camera rental, sound engineer, overtime
- Step 3: Photo/video uploads (Cloudinary — upload zones ready, keys pending)
- Step 4: Description, unique points, ideal_for tags
- Step 5: Amenities (universal — AC, UPS, parking, WiFi, makeup room, etc.)
- Step 6: **Type-specific equipment**:
  - Photography: softboxes, LED panels, ring lights, tripods, backdrops, green matte, camera rental
  - Videography: adds teleprompter, director's monitor; removes ring lights
  - Podcast/Audio: condenser/dynamic/broadcast mics, pop filter, podcast mixer, headphone amp, acoustic panels, soundproofing
  - Music: condenser/dynamic mics, studio monitors, mixing console, DAW workstation, isolation booth, headphone amp, acoustic treatment, DI box, guitar/bass amps, soundproofing
  - Multi-use: all groups shown with section headers
- Step 7: Studio rules (max people, smoking/shoes/food/pets, cancellation policy)
- Step 8: Availability (working days, opening/closing times)
- Step 9: Payout details (bank account, IFSC, UPI ID)
- Step 10: Review & submit (goes to pending for admin approval)

### Payments
- Razorpay checkout fully integrated (`PaymentForm.tsx` + `/api/razorpay/verify/route.ts`)
- Signature verification, booking status update to 'paid', payout record creation
- Wallet credits deducted from total at payment if `apply_wallet_credit: true`
- Awaiting Razorpay keys: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET

### Referral & Wallet
- Every user gets a unique referral code (initials + random suffix) auto-generated
- Referral code entry in booking form Step 2 ("Have a referral code?" link → input)
- `GET /api/referral/validate` — live validation before submission (checks: exists, not own code, no prior referral, no paid bookings yet)
- Applied at first booking creation; reward fires on first payment
- Both referrer and referred user earn ₹200 wallet credit (configurable via banners table → referral_amount)
- `wallet_credits` table tracks individual credits with type and expiry
- `users.wallet_balance` stores running total
- Wallet balance shown in header dropdown and customer dashboard
- Apply wallet credit toggle in booking form Step 3 (shows savings + new total)
- `ReferralCard` component in customer dashboard: share code, copy, WhatsApp share, stats

### Reviews
- Token-based review page at `/review/[id]` — no login required
- Studio profile shows rating + review count + reviews section
- Cron job: `vercel.json` runs `/api/cron/review-requests` daily at 10 AM (WhatsApp review request sent 24h after booking completes)

### Admin Panel (/admin)
- Studios list: approve/reject/feature studios
- Bookings list: view all bookings, filter by status
- Payments: view payments, manual payout processing
  - "Process Payout" button → bank details modal → marks payout as paid with reference
  - `POST /api/admin/payouts/[id]/process` route
- Banners management: create/edit/delete announcement banners, offer banners, feature cards
  - Audience targeting: all / logged_in / logged_out
  - Scheduling via starts_at / ends_at
  - Position: top (AnnouncementBanner), between-sections (OfferBanner), in-grid at position 3 (FeatureCard)

### Owner Dashboard (/studio/dashboard)
- Bookings table with status, customer details, package indicator (📦)
- Confirm / Decline buttons for pending bookings
- Studio package management: `PackagesSection` component — full CRUD modal

### Other
- Favourite studios: heart button on cards + profile, saved section on homepage
- How It Works page: /how-it-works with Creator/Owner tabs, step cards, FAQ, dual CTA
- Legal pages: /about, /privacy, /refund-policy, /terms (all with SiteFooter)
- Mobile-first responsive layout across all pages
- Homepage filter bar: type chips, area dropdown, price range, amenity tags, sort

---

## What's Pending ⏳

### 1. Razorpay credentials (from Arjun)
- Code is fully built and integrated
- Keys needed: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
- Add to `.env.local` and Vercel environment variables

### 2. Cloudinary image uploads
- Upload zones built in onboarding Step 3 with drag-and-drop UI
- Keys needed: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Sign endpoint: `app/api/cloudinary/sign/route.ts` (built, needs keys)

### 3. Google Maps
- Studio profile shows text address only
- Key needed: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- Use for: map embed on studio profile, geocoding in onboarding

### 4. Resend email
- Supabase Auth OTP emails already go via Resend SMTP
- Transactional emails (booking confirmation, GST invoice) not yet wired
- Key in hand: RESEND_API_KEY — `lib/email.ts` is built
- Use for: booking confirmed email to customer, payout receipt to owner

### 5. Phone OTP login
- Needs MSG91 or a real Twilio phone number (~$1/month)
- Current workaround: Email OTP works fine

### 6. Tamil language
- i18n with react-i18next — not started

### 7. Google Maps in onboarding
- Step 1 has a Google Maps link field (text input)
- Should geocode address → store lat/lng → show map pin on studio profile

---

## Key Architecture Decisions

1. **No .catch() on Supabase builders** — use `await` in try/catch blocks always
2. **Prices stored in rupees** (integers), NOT paise — e.g. ₹1200 stored as 1200
3. **Studio contact hidden** until booking.status = 'paid' or 'completed'
4. **Twilio webhook** finds booking by studio owner's phone number (last 10 digits) — owner replies YES or NO
5. **Realtime needs REPLICA IDENTITY FULL** — already applied in migration 010
6. **Auth-aware components** must be 'use client' — use createClient() from lib/supabase/client.ts
7. **Server components** use createClient() from lib/supabase/server.ts
8. **Admin client** (createAdminClient) for webhook/API routes that bypass RLS
9. **Supabase TypeScript `never` type errors** — pre-existing issue with tables not in generated types (referrals, referral_codes, wallet_credits, banners, studio_packages). Cast with `(admin as any)` to bypass. Do not waste time fixing these.
10. **Package pricing** uses `calculatePackagePricing(packagePrice)` — flat subtotal, not hourly × hours. Both functions in `lib/pricing.ts`.
11. **Package soft delete** — never hard-delete packages; set `is_active = false`. Bookings reference package_name/price snapshot, not the live package.
12. **Referral code applied at first booking** — not at signup. `/api/referral/validate` checks eligibility; `/api/bookings` applies it after booking creation; rewards fire on first payment via `handleReferralReward` in verify route.

---

## File Structure

```
framr/
├── app/
│   ├── page.tsx                               # Homepage (server — fetches studios, banners, packages)
│   ├── login/page.tsx                         # Email OTP + Google OAuth
│   ├── dashboard/page.tsx                     # Customer bookings + wallet + referral card
│   ├── how-it-works/page.tsx                  # Creator/Owner path tabs, FAQ
│   ├── review/[id]/page.tsx                   # Token-based no-login review
│   ├── studios/[id]/page.tsx                  # Studio profile (packages + amenities + equipment)
│   ├── studios/[id]/book/
│   │   ├── page.tsx
│   │   └── BookingForm.tsx                    # 3-step form + package mode + wallet + referral code
│   ├── bookings/[id]/
│   │   ├── page.tsx                           # Status page (Realtime)
│   │   ├── pay/
│   │   │   ├── page.tsx
│   │   │   └── PaymentForm.tsx                # Razorpay checkout
│   │   └── success/page.tsx
│   ├── studio/
│   │   ├── onboard/page.tsx                   # 10-step wizard (type-adaptive equipment/charges)
│   │   ├── list/page.tsx                      # Public "List your studio" landing
│   │   ├── submitted/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx                       # Owner dashboard
│   │       └── PackagesSection.tsx            # Package CRUD component
│   ├── admin/
│   │   ├── page.tsx                           # Overview
│   │   ├── studios/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── payments/
│   │   │   ├── page.tsx
│   │   │   └── PayoutsTable.tsx               # Manual payout processing
│   │   └── banners/page.tsx
│   └── api/
│       ├── bookings/route.ts                  # POST (+ referral apply) + GET
│       ├── bookings/[id]/route.ts             # GET + DELETE
│       ├── studios/route.ts                   # GET + POST
│       ├── studios/[id]/packages/route.ts     # GET + POST packages
│       ├── studios/[id]/packages/[packageId]/route.ts  # PATCH + DELETE (soft)
│       ├── referral/route.ts                  # GET user's code + stats
│       ├── referral/apply/route.ts            # POST apply code
│       ├── referral/validate/route.ts         # GET validate code (no apply)
│       ├── wallet/route.ts                    # GET balance + credits
│       ├── twilio/webhook/route.ts            # YES/NO handler ⭐
│       ├── razorpay/verify/route.ts           # Payment verify + referral reward
│       ├── razorpay/webhook/route.ts          # Razorpay webhook
│       ├── cloudinary/sign/route.ts           # Cloudinary upload signature
│       ├── cron/review-requests/route.ts      # Daily review WhatsApp cron
│       ├── profile/route.ts                   # PATCH first/last name
│       ├── admin/payouts/[id]/process/route.ts
│       ├── admin/banners/route.ts
│       ├── admin/banners/[id]/route.ts
│       ├── owner/bookings/[id]/
│       │   ├── confirm-via-link/route.ts
│       │   └── decline-via-link/route.ts
│       └── admin/studios/[id]/[action]/route.ts
├── components/
│   ├── shared/
│   │   ├── SiteHeader.tsx                     # Auth-aware: name, wallet balance, role badge
│   │   ├── SiteFooter.tsx
│   │   ├── HeroBanner.tsx
│   │   └── ClientLayout.tsx                   # Profile completion modal wrapper
│   ├── homepage/HomepageClient.tsx            # Filter logic, grid, banners, favourites, rebook
│   ├── filters/                               # FilterBar, StudioTypeChips, AreaFilter, PriceFilter,
│   │                                          #   AmenityFilter, MobileFilterDrawer, ResultsHeader
│   ├── studio/
│   │   ├── StudioCard.tsx                     # Card with package pill
│   │   ├── PackageCard.tsx                    # Individual package with badge + items
│   │   ├── PackageList.tsx                    # Package section on studio profile
│   │   ├── SearchFilters.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── AmenitiesGrid.tsx
│   │   ├── EquipmentList.tsx
│   │   ├── EarningsCalculator.tsx
│   │   └── ShareButtons.tsx
│   ├── booking/
│   │   ├── BookingStatusCard.tsx              # Realtime updates ⭐
│   │   └── BookingSidebar.tsx
│   ├── referral/ReferralCard.tsx              # Share code, copy, WhatsApp, stats
│   └── profile/ProfileCompletionModal.tsx
├── lib/
│   ├── supabase/server.ts                     # SSR client + createAdminClient
│   ├── supabase/client.ts                     # Browser client
│   ├── whatsapp.ts                            # Twilio functions (booking request, confirm, decline, reviews, referral)
│   ├── pricing.ts                             # calculatePricing + calculatePackagePricing + formatINR
│   ├── razorpay.ts                            # Razorpay order creation
│   ├── email.ts                               # Resend email functions (built, not yet wired)
│   ├── referral-config.ts                     # getReferralAmount() — reads from banners table, default ₹200
│   ├── referral.ts                            # generateReferralCode helper
│   └── validations.ts                         # Zod schemas (booking + full onboard)
├── types/database.types.ts                    # TypeScript types for all tables
├── middleware.ts                              # Auth guard
└── .env.local                                # All secrets
```

---

## Booking Lifecycle

```
pending → awaiting_payment → paid → completed
                          ↘ failed
         ↘ declined
         ↘ cancelled
```

## Pricing Formula

```
subtotal        = price_per_hour × duration_hours   (hourly mode)
                = package_price                      (package mode)
platform_fee    = subtotal × 10%
gst_amount      = platform_fee × 18%
security_deposit = ₹1,200 (fixed)
total_amount    = subtotal + platform_fee + gst_amount + security_deposit
studio_payout   = subtotal - platform_fee
```

---

## Next Tasks (in priority order)

1. **Razorpay keys** — add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET to .env.local + Vercel
2. **Cloudinary keys** — add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
3. **Resend email** — wire `lib/email.ts` to booking confirmation + GST invoice flows
4. **Google Maps** — NEXT_PUBLIC_GOOGLE_MAPS_API_KEY → map on studio profile + geocode in onboarding
5. **Phone OTP login** — MSG91 or real Twilio number
6. **Tamil language** — i18n with react-i18next
