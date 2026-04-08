# framr. — Chennai Studio Booking Platform

**Next.js 14 · Supabase · Twilio WhatsApp · Razorpay (coming)**

---

## 🚀 Quick Start (run locally in 10 minutes)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/framr.git
cd framr
npm install
```

### 2. Set up environment

Your `.env.local` is already pre-filled with Supabase + Twilio keys.  
**Add your Supabase service role key** (required for webhooks):

```bash
# Get from: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJ...
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
framr/
├── app/
│   ├── page.tsx                  # Homepage (discovery)
│   ├── login/page.tsx            # Phone OTP + Google OAuth
│   ├── studios/[id]/             # Studio profile + booking form
│   ├── bookings/[id]/            # Booking status (Realtime)
│   ├── dashboard/                # Customer bookings
│   ├── studio/onboard/           # 10-step studio onboarding
│   ├── admin/                    # Admin panel
│   └── api/
│       ├── bookings/             # Booking CRUD
│       ├── studios/              # Studio CRUD
│       ├── twilio/webhook/       # WhatsApp CONFIRM/DECLINE handler ⭐
│       └── admin/studios/        # Admin approve/reject
├── components/
│   ├── shared/                   # Header, HeroBanner
│   ├── studio/                   # Cards, Gallery, Filters, Amenities
│   └── booking/                  # BookingForm, StatusCard, Sidebar
├── lib/
│   ├── supabase/                 # Server + client helpers
│   ├── whatsapp.ts               # 7 Twilio message functions
│   ├── pricing.ts                # Fee calculator
│   └── validations.ts            # Zod schemas
└── types/database.types.ts       # Full TypeScript types
```

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Already set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Already set |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `TWILIO_ACCOUNT_SID` | ✅ Already set |
| `TWILIO_AUTH_TOKEN` | ✅ Already set |
| `TWILIO_WHATSAPP_FROM` | ✅ Already set |
| `RAZORPAY_KEY_ID` | Coming soon |
| `RAZORPAY_KEY_SECRET` | Coming soon |
| `CLOUDINARY_*` | Create free account at cloudinary.com |

---

## 💬 WhatsApp Flow (Twilio Sandbox — working NOW)

### Test the booking flow:
1. Visit http://localhost:3000
2. Click any studio → Check Availability → book
3. Submit a booking request
4. WhatsApp message goes to studio owner (+91 9994390035 in test mode)
5. Owner replies: `CONFIRM <booking_id>` or `DECLINE <booking_id>`
6. Status updates in real-time on the booking page

### Set up Twilio webhook (required):
```
Twilio Console → Messaging → WhatsApp Sandbox Settings
  When a message comes in: https://your-ngrok-url/api/twilio/webhook
```

For local testing with ngrok:
```bash
npx ngrok http 3000
# Copy the https URL → paste into Twilio Sandbox Settings
```

---

## 🗄️ Database (Supabase — LIVE)

All 10 tables are running at:
**https://khtzyxyqurkakdzsvhza.supabase.co**

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check seed data
SELECT studio_name, area, price_per_hour, status FROM studios;
```

---

## 👤 Create your admin account

```sql
-- Run in Supabase SQL Editor after signing up at /login
-- Replace 'your-user-id' with your actual auth.users.id

INSERT INTO admin_users (id, permissions)
VALUES ('your-user-id', '{super_admin,view_studios,manage_studios,view_bookings,manage_bookings,view_payments,manage_payouts,manage_disputes}');
```

---

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set production env vars
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add TWILIO_AUTH_TOKEN production
# ... all other vars

# Deploy to production
vercel --prod
```

### After deploy:
1. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
2. Update Twilio webhook URL to your production URL
3. Enable Supabase Auth → URL Configuration → Site URL = your Vercel URL

---

## 🔜 Next: Razorpay Integration

Once you have Razorpay credentials, I'll add:
- Payment link creation after studio confirms
- Razorpay webhook handler
- Payout scheduling
- GST invoice generation

Just share your Razorpay test keys and I'll build it immediately.

---

## 📋 Build Status

| Module | Status |
|---|---|
| Database schema (10 tables) | ✅ Live |
| 3 seed studios | ✅ Live |
| Homepage / Discovery | ✅ Built |
| Studio profile page | ✅ Built |
| Booking form (3-step) | ✅ Built |
| Booking status + Realtime | ✅ Built |
| WhatsApp notifications (Twilio) | ✅ Built |
| CONFIRM/DECLINE webhook | ✅ Built |
| Login (Phone OTP + Google) | ✅ Built |
| Studio onboarding (10-step) | ✅ Built |
| Customer dashboard | ✅ Built |
| Admin panel | ✅ Built |
| Razorpay payment | ⏳ Pending credentials |
| Cloudinary image upload | ⏳ Pending account |
| Studio owner dashboard | ⏳ Next |
