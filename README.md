# studiodistrict — Chennai Studio Booking Platform

**Next.js 14 · Supabase · Twilio WhatsApp · Razorpay (coming)**

---

## 🚀 Quick Start (run locally in 10 minutes)

### 1. Clone and install

```bash
git clone https://github.com/contactstudiodistrict-eng/studiodistrict.git
cd studiodistrict
npm install
```

### 2. Set up environment

Copy `.env.local.example` to `.env.local` and fill in your keys.

```bash
cp .env.local.example .env.local
```

### 3. Run locally

```bash
npm run dev
# Opens at http://localhost:3000
```

### 4. See the homepage

The database is seeded with 3 live studios:
- **Lumière Studio Co.** — Velachery (Photography, ₹1,200/hr)
- **SoundBox OMR** — OMR (Podcast, ₹800/hr)
- **Frame & Co. Studios** — Anna Nagar (Video, ₹1,500/hr)

Visit http://localhost:3000 — you'll see all 3 immediately.

---

## 📁 Project Structure

```
studiodistrict/
├── app/
│   ├── page.tsx                  # Homepage (discovery)
│   ├── login/page.tsx            # Magic link + Phone OTP
│   ├── studios/[id]/             # Studio profile + booking form
│   ├── bookings/[id]/            # Booking status (Realtime)
│   ├── dashboard/                # Customer bookings
│   ├── studio/onboard/           # 10-step studio onboarding
│   ├── admin/                    # Admin panel
│   └── api/
│       ├── bookings/             # Booking CRUD
│       ├── studios/              # Studio CRUD
│       ├── twilio/webhook/       # WhatsApp YES/NO handler ⭐
│       └── admin/studios/        # Admin approve/reject
├── components/
│   ├── shared/                   # Header, HeroBanner
│   ├── studio/                   # Cards, Gallery, Filters, Amenities
│   └── booking/                  # BookingForm, StatusCard, Sidebar
├── lib/
│   ├── supabase/                 # Server + client helpers
│   ├── whatsapp.ts               # Twilio message functions
│   ├── pricing.ts                # Fee calculator
│   └── validations.ts            # Zod schemas
├── scripts/                      # One-time admin/migration scripts
└── types/database.types.ts       # Full TypeScript types
```

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `TWILIO_ACCOUNT_SID` | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Twilio Console |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp Sandbox |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload presets |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console |

---

## 💬 WhatsApp Flow (Twilio Sandbox)

### Test the booking flow:
1. Visit http://localhost:3000
2. Click any studio → Check Availability → book
3. Submit a booking request
4. WhatsApp message goes to studio owner
5. Owner replies `YES` or `NO`
6. Status updates in real-time on the booking page

### Set up Twilio webhook (local dev):
```bash
# Start tunnel
npx cloudflared tunnel --url http://localhost:3000

# Paste the URL into:
# Twilio Console → Messaging → WhatsApp Sandbox Settings
# When a message comes in: https://xxxx.trycloudflare.com/api/twilio/webhook
```

---

## 🗄️ Database (Supabase)

10 tables: `users`, `studios`, `studio_images`, `studio_amenities`,
`studio_equipment`, `bookings`, `payments`, `payouts`, `admin_users`, `audit_logs`

---

## 👤 Grant admin access

```bash
node scripts/make_admin.mjs your@email.com
```

---

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

After deploy:
1. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
2. Update Twilio webhook URL to your production URL
3. Supabase → Auth → URL Configuration → Site URL = your Vercel URL

---

## 📋 Build Status

| Module | Status |
|---|---|
| Database schema (10 tables) | ✅ Live |
| Homepage / Discovery | ✅ Built |
| Studio profile page | ✅ Built |
| Booking form (3-step) | ✅ Built |
| Booking status + Realtime | ✅ Built |
| WhatsApp notifications | ✅ Built |
| Login (magic link) | ✅ Built |
| Studio onboarding (10-step) | ✅ Built |
| Cloudinary image uploads | ✅ Built |
| Customer dashboard | ✅ Built |
| Studio owner dashboard | ✅ Built |
| Admin panel | ✅ Built |
| Awaiting payment timeout (pg_cron) | ✅ Built |
| Razorpay payment | ⏳ Pending credentials |
| Google Maps | ⏳ Pending API key |
| Vercel deployment | ⏳ Pending |
