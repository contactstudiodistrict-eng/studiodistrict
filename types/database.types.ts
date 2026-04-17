// types/database.types.ts
// Run: npx supabase gen types typescript --project-id khtzyxyqurkakdzsvhza > types/database.types.ts
// This is the manual version matching our exact schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          email: string | null
          avatar_url: string | null
          role: 'customer' | 'studio_owner' | 'admin'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      studios: {
        Row: {
          id: string
          owner_id: string
          studio_name: string
          studio_type: 'photography' | 'videography' | 'audio' | 'music' | 'mixed'
          owner_name: string
          owner_phone: string
          owner_alt_phone: string | null
          email: string
          address: string
          google_maps_link: string | null
          latitude: number | null
          longitude: number | null
          area: string | null
          price_per_hour: number
          minimum_hours: number
          half_day_rate: number | null
          full_day_rate: number | null
          extra_charges_json: Json
          short_description: string | null
          full_description: string | null
          unique_points: string | null
          ideal_for: string[] | null
          thumbnail_url: string | null
          max_people: number
          no_smoking: boolean
          no_shoes: boolean
          food_allowed: boolean
          pets_allowed: boolean
          overtime_charges: number | null
          cancellation_policy: 'free_24h' | 'free_48h' | 'partial_24h' | 'no_refund'
          working_days: string[]
          opening_time: string
          closing_time: string
          closed_dates: string[] | null
          bank_account_name: string | null
          account_number: string | null
          ifsc: string | null
          upi_id: string | null
          status: 'draft' | 'pending' | 'live' | 'suspended'
          rating: number
          review_count: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['studios']['Row'], 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>
        Update: Partial<Database['public']['Tables']['studios']['Insert']>
      }
      studio_images: {
        Row: {
          id: string
          studio_id: string
          url: string
          cloudinary_id: string | null
          image_type: 'studio' | 'backdrop' | 'equipment' | 'walkthrough'
          display_order: number
          is_thumbnail: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['studio_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['studio_images']['Insert']>
      }
      studio_amenities: {
        Row: {
          id: string; studio_id: string
          ac: boolean; parking: boolean; makeup_room: boolean; changing_room: boolean
          restroom: boolean; wifi: boolean; power_backup: boolean; natural_light: boolean
          elevator: boolean; props: boolean; waiting_area: boolean; pantry: boolean
        }
        Insert: Omit<Database['public']['Tables']['studio_amenities']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['studio_amenities']['Insert']>
      }
      studio_equipment: {
        Row: {
          id: string; studio_id: string
          softboxes: boolean; led_panels: boolean; ring_lights: boolean; tripods: boolean
          light_stands: boolean; backdrop_white: boolean; backdrop_black: boolean
          backdrop_colors: boolean; green_matte: boolean; audio_gear: boolean
          mic_types: string[] | null; soundproofing: boolean; camera_rental: boolean
          camera_details: string | null
        }
        Insert: Omit<Database['public']['Tables']['studio_equipment']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['studio_equipment']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          booking_ref: string
          studio_id: string
          user_id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          booking_date: string
          start_time: string
          end_time: string
          duration_hours: number
          shoot_type: string
          notes: string | null
          addons_json: Json
          studio_rate: number
          subtotal: number
          platform_fee: number
          gst_amount: number
          total_amount: number
          security_deposit: number
          studio_payout_amount: number
          status: 'pending' | 'confirmed' | 'awaiting_payment' | 'paid' | 'completed' | 'declined' | 'cancelled'
          confirmed_at: string | null
          paid_at: string | null
          completed_at: string | null
          wa_message_sid: string | null
          studio_wa_response: string | null
          wa_payment_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'booking_ref' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          razorpay_link_id: string | null
          razorpay_link_url: string | null
          amount: number
          platform_commission: number
          gst_on_commission: number
          studio_payout_amount: number
          payment_method: string | null
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          paid_at: string | null
          webhook_payload: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      payouts: {
        Row: {
          id: string; booking_id: string; studio_id: string; payment_id: string | null
          amount: number; razorpay_payout_id: string | null; payout_method: string
          status: 'pending' | 'processing' | 'paid' | 'failed'
          scheduled_for: string | null; paid_at: string | null; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payouts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payouts']['Insert']>
      }
      admin_users: {
        Row: { id: string; permissions: string[]; created_at: string }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string; user_id: string | null; action: string; entity_type: string
          entity_id: string; old_value: Json | null; new_value: Json | null
          ip_address: string | null; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
  }
}

// Convenience type aliases
export type Studio = Database['public']['Tables']['studios']['Row']
export type StudioInsert = Database['public']['Tables']['studios']['Insert']
export type StudioImage = Database['public']['Tables']['studio_images']['Row']
export type StudioAmenities = Database['public']['Tables']['studio_amenities']['Row']
export type StudioEquipment = Database['public']['Tables']['studio_equipment']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type Payment = Database['public']['Tables']['payments']['Row']
export type User = Database['public']['Tables']['users']['Row']

// Studio with all relations (used in profile page)
export type StudioWithDetails = Studio & {
  studio_images: StudioImage[]
  studio_amenities: StudioAmenities | null
  studio_equipment: StudioEquipment | null
}

// Booking with studio info (used in booking status page)
export type BookingWithStudio = Booking & {
  studios: Pick<Studio, 'studio_name' | 'address' | 'owner_phone' | 'google_maps_link' | 'thumbnail_url'>
}

// Banner (homepage announcement / offer / feature cards / referral)
export interface Banner {
  id: string
  type: 'announcement' | 'offer' | 'feature' | 'referral'
  title: string
  body: string | null
  cta_label: string | null
  cta_url: string | null
  bg_color: string
  text_color: string
  accent_color: string
  is_active: boolean
  is_dismissable: boolean
  show_to: 'all' | 'logged_in' | 'logged_out'
  starts_at: string | null
  ends_at: string | null
  created_by: string | null
  created_at: string
  display_order: number
  referral_amount: number | null
}
