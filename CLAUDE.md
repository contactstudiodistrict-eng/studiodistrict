# Studio District — Chennai Studio Booking Platform
## Claude Code Project Context

> This file gives Claude Code full context of the project.
> Read this FIRST before making any changes.

---

## What this project is

A mobile-first studio rental marketplace for Chennai — like Peerspace.com but for
photo, video, podcast, and music studios. Built by Arjun (IT professional + photographer).

**Live URLs (local dev):**
- App: http://localhost:3000
- Admin: http://localhost:3000/admin
- Owner dashboard: http://localhost:3000/studio/dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router + TailwindCSS |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| WhatsApp | Twilio WhatsApp Sandbox |
| Payments | Razorpay (stub — credentials pending) |
| Images | Cloudinary (not yet configured) |
| Maps | Google Maps (not yet configured) |
| Deployment | Vercel (not yet deployed) |

---

## Supabase Project

```
Project ID:   khtzyxyqurkakdzsvhza
URL:          https://khtzyxyqurkakdzsvhza.supabase.co
Anon Key:     (see .env.local — NEXT_PUBLIC_SUPABASE_ANON_KEY)
Service Role: (see .env.local — SUPABASE_SERVICE_ROLE_KEY)
```

**Migrations applied (10):**
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

**10 tables:** users, studios, studio_images, studio_amenities,
studio_equipment, bookings, payments, payouts, admin_users, audit_logs

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

- Homepage + studio discovery + filters
- Studio profile page (amenities, equipment, pricing, rules)
- 3-step booking form (date/time → details → review)
- Booking created → WhatsApp notification to studio owner
- Studio replies YES → customer gets payment link via WhatsApp
- Studio replies NO → customer gets decline notification
- Booking status page with Supabase Realtime (+ 10s polling fallback)
- Studio contact details hidden until after payment
- Login: Email magic link (working) + Phone OTP (needs MSG91)
- Auth-aware header (shows name, role, dropdown)
- Studio onboarding — 10-step wizard
- Customer dashboard — booking history
- Studio owner dashboard — bookings + confirm/decline buttons
- Admin panel — studios, bookings, payments management
- Legal pages: /about, /privacy, /refund-policy, /terms
- Site footer (SiteFooter component) on all legal + public pages
- Mobile-first responsive layout across all pages
- Favourite studios: heart button on cards + profile, saved section on homepage
- Recently booked: "Book again" cards on homepage, rebook pre-fill in BookingForm
- Referral system: unique codes, WhatsApp share, ₹200 wallet credits on first booking
- Wallet credit: balance shown in header + dashboard, apply toggle at checkout
- Reviews: token-based no-login review page (/review/[id]), studio profile ratings section, cron job for WhatsApp review requests
- vercel.json cron: /api/cron/review-requests runs hourly

---

## What's Pending ⏳

### 1. Razorpay (credentials pending from Arjun)
- `lib/razorpay.ts` is stubbed — real implementation waiting for keys
- `app/api/razorpay/webhook/route.ts` is fully built
- `app/bookings/[id]/pay/page.tsx` shows placeholder
- Keys needed: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET

### 2. Cloudinary image uploads
- Onboarding form has upload zones but no actual upload logic
- Keys needed: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- File to update: `app/studio/onboard/page.tsx` (Step 3)

### 3. Phone OTP login
- Supabase Phone provider needs MSG91 (not Twilio sandbox — different product)
- Or: buy a real Twilio phone number (~$1/month)
- Current workaround: Email magic link works fine

### 4. Google Maps
- Studio profile shows text address only
- Keys needed: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

### 5. Vercel deployment
- Not yet deployed
- All env vars in .env.local need to go into Vercel project settings

---

## Key Architecture Decisions

1. **No .catch() on Supabase builders** — use `await` in try/catch blocks always
2. **Prices stored in rupees** (integers), NOT paise — e.g. ₹1200 stored as 1200
3. **Studio contact hidden** until booking.status = 'paid' or 'completed'
4. **Twilio webhook** finds booking by studio owner's phone number (last 10 digits)
   — owner just replies YES or NO, no ID needed
5. **Realtime needs REPLICA IDENTITY FULL** — already applied in migration 010
6. **Auth-aware components** must be 'use client' — use createClient() from lib/supabase/client.ts
7. **Server components** use createClient() from lib/supabase/server.ts
8. **Admin client** (createAdminClient) for webhook/API routes that bypass RLS

---

## File Structure

```
framr/
├── app/
│   ├── page.tsx                          # Homepage
│   ├── login/page.tsx                    # Auth page
│   ├── dashboard/page.tsx                # Customer bookings
│   ├── studios/[id]/page.tsx             # Studio profile
│   ├── studios/[id]/book/
│   │   ├── page.tsx
│   │   └── BookingForm.tsx               # 3-step form (client)
│   ├── bookings/[id]/
│   │   ├── page.tsx                      # Status page
│   │   ├── pay/page.tsx                  # Payment page (stub)
│   │   └── success/page.tsx
│   ├── studio/
│   │   ├── onboard/page.tsx              # 10-step wizard
│   │   └── dashboard/page.tsx            # Owner dashboard
│   ├── admin/
│   │   ├── page.tsx                      # Overview
│   │   ├── studios/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── payments/page.tsx
│   └── api/
│       ├── bookings/route.ts             # POST + GET
│       ├── bookings/[id]/route.ts        # GET + DELETE
│       ├── studios/route.ts              # GET + POST
│       ├── twilio/webhook/route.ts       # YES/NO handler ⭐
│       ├── razorpay/webhook/route.ts     # Payment webhook (ready)
│       ├── owner/bookings/[id]/
│       │   ├── confirm-via-link/route.ts
│       │   └── decline-via-link/route.ts
│       └── admin/studios/[id]/[action]/route.ts
├── components/
│   ├── shared/SiteHeader.tsx             # Auth-aware header
│   ├── shared/HeroBanner.tsx
│   ├── studio/
│   │   ├── StudioCard.tsx
│   │   ├── StudioGrid.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── AmenitiesGrid.tsx
│   │   └── EquipmentList.tsx
│   └── booking/
│       ├── BookingStatusCard.tsx         # Realtime updates ⭐
│       └── BookingSidebar.tsx
├── lib/
│   ├── supabase/server.ts               # SSR client + admin client
│   ├── supabase/client.ts               # Browser client
│   ├── whatsapp.ts                      # 7 Twilio functions
│   ├── pricing.ts                       # Fee calculator
│   ├── razorpay.ts                      # Stub → activate with keys
│   └── validations.ts                   # Zod schemas
├── types/database.types.ts              # Full TypeScript types
├── middleware.ts                        # Auth guard
└── .env.local                          # All secrets
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
subtotal        = price_per_hour × duration_hours
platform_fee    = subtotal × 10%
gst_amount      = platform_fee × 18%
security_deposit = ₹1,200 (fixed)
total_amount    = subtotal + platform_fee + gst_amount + security_deposit
studio_payout   = subtotal - platform_fee
```

---

## Next Tasks (in priority order)

1. **Razorpay** — wire real payment link + webhook → booking locks after pay
2. **Cloudinary** — real image uploads in onboarding form
3. **MSG91** — phone OTP for Indian customers
4. **Google Maps** — geocoding in onboarding, map embed on profile
5. **Vercel deploy** — production URL
6. **Reviews system** — post-booking review from customer
7. **Email notifications** — GST invoice via Resend.com
8. **Tamil language** — i18n with react-i18next
