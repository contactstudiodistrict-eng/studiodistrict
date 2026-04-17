// lib/validations.ts
import { z } from 'zod'

// ─── Booking form ──────────────────────────────────────────────────────────
export const bookingFormSchema = z.object({
  studio_id:      z.string().uuid(),
  customer_name:  z.string().min(2, 'Name must be at least 2 characters'),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  booking_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  start_time:     z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  end_time:       z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  duration_hours: z.number().min(1).max(12),
  shoot_type:     z.enum([
    'Model Portfolio', 'Product Creative', 'Social Media / Reels',
    'Brand Campaign', 'YouTube Content', 'Podcast Recording',
    'Music Recording', 'Personal / Family', 'Event Coverage', 'Other'
  ]),
  notes:          z.string().max(500).optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

// ─── Studio onboarding form (all 10 steps combined) ───────────────────────
export const studioOnboardSchema = z.object({
  // Step 1: Basic info
  studio_name:    z.string().min(3, 'Studio name must be at least 3 characters'),
  studio_type:    z.enum(['photography', 'videography', 'audio', 'music', 'mixed']),
  owner_name:     z.string().min(2),
  owner_phone:    z.string().regex(/^[6-9]\d{9}$/, 'Enter valid WhatsApp number'),
  owner_alt_phone: z.string().optional(),
  email:          z.string().email(),
  address:        z.string().min(10),
  google_maps_link: z.string().url().optional().or(z.literal('')),
  area:           z.string().min(2),

  // Step 2: Pricing
  price_per_hour: z.number().min(200, 'Minimum ₹200/hr').max(50000),
  minimum_hours:  z.number().min(1).max(12).default(2),
  half_day_rate:  z.number().positive().optional().or(z.nan().transform(() => undefined)).or(z.null().transform(() => undefined)),
  full_day_rate:  z.number().positive().optional().or(z.nan().transform(() => undefined)).or(z.null().transform(() => undefined)),
  extra_charges_json: z.record(z.number()).optional(),

  // Step 4: Descriptions
  short_description: z.string().max(150).optional(),
  full_description:  z.string().max(2000).optional(),
  unique_points:     z.string().max(500).optional(),
  ideal_for:         z.array(z.string()).optional(),

  // Step 5: Amenities (all booleans)
  ac:            z.boolean().default(false),
  parking:       z.boolean().default(false),
  makeup_room:   z.boolean().default(false),
  changing_room: z.boolean().default(false),
  restroom:      z.boolean().default(false),
  wifi:          z.boolean().default(false),
  power_backup:  z.boolean().default(false),
  natural_light: z.boolean().default(false),
  elevator:      z.boolean().default(false),
  props:         z.boolean().default(false),
  waiting_area:  z.boolean().default(false),
  pantry:        z.boolean().default(false),

  // Step 6: Equipment
  softboxes:       z.boolean().default(false),
  led_panels:      z.boolean().default(false),
  ring_lights:     z.boolean().default(false),
  tripods:         z.boolean().default(false),
  light_stands:    z.boolean().default(false),
  backdrop_white:  z.boolean().default(false),
  backdrop_black:  z.boolean().default(false),
  backdrop_colors: z.boolean().default(false),
  green_matte:     z.boolean().default(false),
  audio_gear:      z.boolean().default(false),
  soundproofing:   z.boolean().default(false),
  camera_rental:   z.boolean().default(false),
  camera_details:  z.string().optional(),

  // Step 7: Rules
  max_people:           z.number().min(1).max(50).default(8),
  no_smoking:           z.boolean().default(true),
  no_shoes:             z.boolean().default(true),
  food_allowed:         z.boolean().default(false),
  pets_allowed:         z.boolean().default(false),
  overtime_charges:     z.number().positive().optional().or(z.nan().transform(() => undefined)).or(z.null().transform(() => undefined)),
  cancellation_policy:  z.enum(['free_24h','free_48h','partial_24h','no_refund']).default('free_24h'),

  // Step 8: Availability
  working_days:  z.array(z.enum(['mon','tue','wed','thu','fri','sat','sun'])).min(1, 'Select at least one working day'),
  opening_time:  z.string().default('07:00'),
  closing_time:  z.string().default('21:00'),

  // Step 9: Payout
  bank_account_name: z.string().optional(),
  account_number:    z.string().optional(),
  ifsc:              z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC').optional().or(z.literal('')),
  upi_id:            z.string().optional(),
})

export type StudioOnboardData = z.infer<typeof studioOnboardSchema>

// ─── Auth schemas ──────────────────────────────────────────────────────────
export const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
})

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
})
