'use client'
// app/studio/onboard/page.tsx
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { studioOnboardSchema, type StudioOnboardData } from '@/lib/validations'

type UploadedImage = { url: string; cloudinary_id: string; image_type: string }

// ── Step definitions ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Basic Info',    icon: '🏠' },
  { id: 2, title: 'Pricing',       icon: '💰' },
  { id: 3, title: 'Media',         icon: '📸' },
  { id: 4, title: 'Description',   icon: '📝' },
  { id: 5, title: 'Amenities',     icon: '✅' },
  { id: 6, title: 'Equipment',     icon: '🔧' },
  { id: 7, title: 'Rules',         icon: '📋' },
  { id: 8, title: 'Availability',  icon: '📅' },
  { id: 9, title: 'Payout',        icon: '🏦' },
  { id: 10,title: 'Review',        icon: '🚀' },
]

const IDEAL_FOR_OPTIONS = [
  'Model Portfolio', 'Product Creative', 'Brand Campaign',
  'YouTube Content', 'Social Media / Reels', 'Podcast Recording',
  'Music Recording', 'Corporate Videos', 'Personal / Family', 'Event Coverage',
]

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const
const DAY_LABELS: Record<string, string> = {
  mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun'
}

export default function StudioOnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const { register, handleSubmit, watch, setValue, getValues, trigger, formState: { errors } } = useForm<StudioOnboardData>({
    defaultValues: {
      studio_type: 'photography',
      minimum_hours: 2,
      max_people: 8,
      no_smoking: true,
      no_shoes: true,
      food_allowed: false,
      pets_allowed: false,
      cancellation_policy: 'free_24h',
      working_days: ['mon','tue','wed','thu','fri','sat'],
      opening_time: '07:00',
      closing_time: '21:00',
      ideal_for: [],
    },
  })

  const watchWorkingDays = watch('working_days') || []
  const watchIdealFor = watch('ideal_for') || []

  function toggleDay(day: string) {
    const current = watchWorkingDays
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
    setValue('working_days', updated as any)
  }

  function toggleIdealFor(item: string) {
    const current = watchIdealFor
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item]
    setValue('ideal_for', updated)
  }

  const STEP_FIELDS: Partial<Record<number, (keyof StudioOnboardData)[]>> = {
    1: ['studio_name', 'studio_type', 'owner_name', 'owner_phone', 'email', 'area', 'address'],
    2: ['price_per_hour'],
    8: ['working_days'],
  }

  async function handleNext() {
    const fields = STEP_FIELDS[step]
    if (fields && fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    if (step === 3) {
      const photoCount = uploadedImages.filter(i => i.image_type !== 'video').length
      if (photoCount > 0 && photoCount < 3) {
        toast.error('Please upload at least 3 studio photos')
        return
      }
    }
    setStep(s => s + 1)
  }

  function addImages(imgs: UploadedImage[]) {
    setUploadedImages(prev => [...prev, ...imgs])
  }

  function removeImage(cloudinaryId: string) {
    setUploadedImages(prev => prev.filter(i => i.cloudinary_id !== cloudinaryId))
  }

  const onSubmit = async (data: StudioOnboardData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/studios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image_urls: uploadedImages }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Submission failed')
      toast.success('Studio submitted for review! We\'ll notify you via WhatsApp within 24 hours.')
      router.push('/studio/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = (step / 10) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-sans font-bold text-xl tracking-tight" style={{ textDecoration: 'none', letterSpacing: '-0.03em' }}>
            <span className="text-ink-900">Studio</span><span className="text-brand-500">District</span>
          </a>
          <span className="text-sm text-gray-500">Step {step} of 10</span>
        </div>
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-8 pb-1">
          {STEPS.map(s => (
            <button key={s.id} type="button" onClick={() => setStep(s.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${step === s.id ? 'bg-brand-500 text-white' : s.id < step ? 'bg-green-100 text-green-700' : 'bg-white text-gray-400 border border-gray-100'}`}>
              {s.id < step ? '✓' : s.icon} {s.title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── Step 1: Basic Info ────────────────────────────── */}
          {step === 1 && (
            <StepCard title="Basic Information" icon="🏠" subtitle="Tell us about your studio and how to reach you">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Studio name" span={2} error={errors.studio_name?.message}>
                  <input {...register('studio_name')} placeholder="e.g. Lumière Studio Co." className={inputCls} />
                </Field>
                <Field label="Studio type" error={errors.studio_type?.message}>
                  <select {...register('studio_type')} className={selectCls}>
                    <option value="photography">📸 Photography</option>
                    <option value="videography">🎬 Videography</option>
                    <option value="audio">🎙 Podcast / Audio</option>
                    <option value="music">🎵 Music Recording</option>
                    <option value="mixed">🎭 Multi-use</option>
                  </select>
                </Field>
                <Field label="Area / Locality" error={errors.area?.message}>
                  <input {...register('area')} placeholder="e.g. Velachery" className={inputCls} />
                </Field>
                <Field label="Owner name" error={errors.owner_name?.message}>
                  <input {...register('owner_name')} placeholder="Your full name" className={inputCls} />
                </Field>
                <Field label="WhatsApp number" error={errors.owner_phone?.message}>
                  <div className="flex">
                    <span className={prefixCls}>+91</span>
                    <input {...register('owner_phone')} type="tel" placeholder="9876543210" className={`${inputCls} rounded-l-none border-l-0`} />
                  </div>
                </Field>
                <Field label="Alternate phone">
                  <div className="flex">
                    <span className={prefixCls}>+91</span>
                    <input {...register('owner_alt_phone')} type="tel" className={`${inputCls} rounded-l-none border-l-0`} />
                  </div>
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <input {...register('email')} type="email" placeholder="studio@email.com" className={inputCls} />
                </Field>
                <Field label="Full address" span={2} error={errors.address?.message}>
                  <input {...register('address')} placeholder="Street, area, Chennai, PIN" className={inputCls} />
                </Field>
                <Field label="Google Maps link" span={2}>
                  <input {...register('google_maps_link')} type="url" placeholder="https://maps.google.com/…" className={inputCls} />
                </Field>
              </div>
            </StepCard>
          )}

          {/* ── Step 2: Pricing ───────────────────────────────── */}
          {step === 2 && (
            <StepCard title="Pricing" icon="💰" subtitle="Set your hourly rates and any extra charges">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price per hour (₹)" error={errors.price_per_hour?.message}>
                  <input {...register('price_per_hour', { valueAsNumber: true })} type="number" placeholder="1200" className={inputCls} />
                </Field>
                <Field label="Minimum hours">
                  <input {...register('minimum_hours', { valueAsNumber: true })} type="number" min={1} max={12} className={inputCls} />
                </Field>
                <Field label="Half-day rate (₹) — optional">
                  <input {...register('half_day_rate', { setValueAs: v => v === '' || v === null ? undefined : Number(v) })} type="number" placeholder="4200" className={inputCls} />
                </Field>
                <Field label="Full-day rate (₹) — optional">
                  <input {...register('full_day_rate', { setValueAs: v => v === '' || v === null ? undefined : Number(v) })} type="number" placeholder="7500" className={inputCls} />
                </Field>
              </div>

              <div className="mt-4 p-4 bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-700">
                💡 Studio District charges a 10% platform fee on each booking. This is deducted from the customer&apos;s payment — your listed price is what you receive.
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Extra charges (optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'lighting_tech', label: 'Lighting tech (₹/hr)' },
                    { key: 'camera_rental', label: 'Camera rental (₹/hr)' },
                    { key: 'backdrop_set', label: 'Backdrop change (₹/each)' },
                    { key: 'overtime', label: 'Overtime rate (₹/hr)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        placeholder="0"
                        className={inputCls}
                        onChange={e => {
                          const current = (getValues('extra_charges_json') as Record<string, number>) || {}
                          setValue('extra_charges_json', { ...current, [key]: Number(e.target.value) })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Step 3: Media ─────────────────────────────────── */}
          {step === 3 && (
            <StepCard title="Photos & Media" icon="📸" subtitle="Good photos get 3× more bookings. Minimum 5, up to 15.">
              <div className="space-y-4">
                <ImageUploadZone label="Studio photos (5–15)" sublabel="Main space, lighting setup, overall look" icon="🖼️"
                  hint="First photo becomes your thumbnail. Landscape orientation works best."
                  imageType="studio" images={uploadedImages.filter(i => i.image_type === 'studio')}
                  onAdd={addImages} onRemove={removeImage} multiple />
                <ImageUploadZone label="Backdrop & set photos" sublabel="All available backdrops and set configurations" icon="🎨"
                  imageType="backdrop" images={uploadedImages.filter(i => i.image_type === 'backdrop')}
                  onAdd={addImages} onRemove={removeImage} multiple />
                <ImageUploadZone label="Equipment photos" sublabel="Lights, cameras, audio gear, props" icon="🔧"
                  imageType="equipment" images={uploadedImages.filter(i => i.image_type === 'equipment')}
                  onAdd={addImages} onRemove={removeImage} multiple />
                <ImageUploadZone label="Walkthrough video (optional)" sublabel="Short 1–3 min tour of the studio. MP4, max 100MB." icon="🎬"
                  hint="Video tours convert 40% more visitors."
                  imageType="video" images={uploadedImages.filter(i => i.image_type === 'video')}
                  onAdd={addImages} onRemove={removeImage} accept="video/mp4,video/quicktime" resourceType="video" />

                {uploadedImages.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                    ✅ {uploadedImages.filter(i => i.image_type !== 'video').length} photo{uploadedImages.filter(i => i.image_type !== 'video').length !== 1 ? 's' : ''} uploaded
                    {uploadedImages.some(i => i.image_type === 'video') ? ' + 1 video' : ''}
                  </div>
                )}
              </div>
            </StepCard>
          )}

          {/* ── Step 4: Description ───────────────────────────── */}
          {step === 4 && (
            <StepCard title="Describe Your Studio" icon="📝" subtitle="Help creators understand what makes your space special">
              <div className="space-y-4">
                <Field label="Short description (shown on cards, max 150 chars)">
                  <input {...register('short_description')} placeholder="e.g. Premium photo studio with cyclorama wall in Velachery" className={inputCls} maxLength={150} />
                </Field>
                <Field label="Full description">
                  <textarea {...register('full_description')} rows={5} placeholder="Describe your studio in detail — the space, the vibe, what makes it great for creators…" className={`${inputCls} resize-none`} />
                </Field>
                <Field label="What makes your studio unique?">
                  <textarea {...register('unique_points')} rows={3} placeholder="e.g. Only studio in Velachery with 3-wall cyclorama. Free parking for 6 cars. 24/7 AC with UPS." className={`${inputCls} resize-none`} />
                </Field>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ideal for (select all that apply)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {IDEAL_FOR_OPTIONS.map(item => (
                      <button key={item} type="button" onClick={() => toggleIdealFor(item)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all text-left
                          ${watchIdealFor.includes(item) ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs
                          ${watchIdealFor.includes(item) ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300'}`}>
                          {watchIdealFor.includes(item) ? '✓' : ''}
                        </span>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Step 5: Amenities ─────────────────────────────── */}
          {step === 5 && (
            <StepCard title="Amenities" icon="✅" subtitle="Check everything your studio offers">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'ac',            icon: '❄️', label: 'AC (24/7)' },
                  { name: 'power_backup',  icon: '🔌', label: 'UPS / Power backup' },
                  { name: 'parking',       icon: '🚗', label: 'Free parking' },
                  { name: 'wifi',          icon: '📶', label: 'WiFi' },
                  { name: 'makeup_room',   icon: '💄', label: 'Makeup room' },
                  { name: 'changing_room', icon: '👗', label: 'Changing room' },
                  { name: 'restroom',      icon: '🚿', label: 'Restroom' },
                  { name: 'elevator',      icon: '🛗', label: 'Elevator' },
                  { name: 'natural_light', icon: '🌿', label: 'Natural light' },
                  { name: 'waiting_area',  icon: '🪑', label: 'Waiting area' },
                  { name: 'pantry',        icon: '☕', label: 'Pantry / Refreshments' },
                  { name: 'props',         icon: '🎭', label: 'Props available' },
                ].map(({ name, icon, label }) => (
                  <label key={name} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${watch(name as any) ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="checkbox" {...register(name as any)} className="w-4 h-4 accent-brand-500" />
                    <span className="text-lg">{icon}</span>
                    <span className={`text-sm font-medium ${watch(name as any) ? 'text-brand-700' : 'text-gray-600'}`}>{label}</span>
                  </label>
                ))}
              </div>
            </StepCard>
          )}

          {/* ── Step 6: Equipment ─────────────────────────────── */}
          {step === 6 && (
            <StepCard title="Equipment" icon="🔧" subtitle="What equipment is available for renters?">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'softboxes',       label: 'Softboxes' },
                  { name: 'led_panels',      label: 'LED panels' },
                  { name: 'ring_lights',     label: 'Ring lights' },
                  { name: 'tripods',         label: 'Tripods' },
                  { name: 'light_stands',    label: 'Light stands' },
                  { name: 'backdrop_white',  label: 'White backdrop' },
                  { name: 'backdrop_black',  label: 'Black backdrop' },
                  { name: 'backdrop_colors', label: 'Coloured backdrops' },
                  { name: 'green_matte',     label: 'Green matte' },
                  { name: 'audio_gear',      label: 'Audio gear' },
                  { name: 'soundproofing',   label: 'Soundproofing' },
                  { name: 'camera_rental',   label: 'Camera rental' },
                ].map(({ name, label }) => (
                  <label key={name} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${watch(name as any) ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="checkbox" {...register(name as any)} className="w-4 h-4 accent-brand-500" />
                    <span className={`text-sm font-medium ${watch(name as any) ? 'text-brand-700' : 'text-gray-600'}`}>{label}</span>
                  </label>
                ))}
              </div>
              {watch('camera_rental') && (
                <Field label="Camera details (model + lens)" className="mt-4">
                  <input {...register('camera_details')} placeholder="e.g. Sony A7IV + 24-70mm G-Master" className={inputCls} />
                </Field>
              )}
            </StepCard>
          )}

          {/* ── Step 7: Rules ─────────────────────────────────── */}
          {step === 7 && (
            <StepCard title="Studio Rules" icon="📋" subtitle="Set clear expectations for renters">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Max people per session">
                    <input {...register('max_people', { valueAsNumber: true })} type="number" min={1} max={50} className={inputCls} />
                  </Field>
                  <Field label="Overtime rate (₹/hr)">
                    <input {...register('overtime_charges', { setValueAs: v => v === '' || v === null ? undefined : Number(v) })} type="number" placeholder="1500" className={inputCls} />
                  </Field>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'no_smoking', label: 'No smoking inside', defaultOn: true },
                    { name: 'no_shoes',   label: 'No outdoor shoes', defaultOn: true },
                    { name: 'food_allowed', label: 'Light snacks allowed', defaultOn: false },
                    { name: 'pets_allowed', label: 'Pets allowed', defaultOn: false },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-all">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <div className="relative">
                        <input type="checkbox" {...register(name as any)} className="sr-only peer" />
                        <div className="w-10 h-6 rounded-full border border-gray-200 bg-gray-100 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all" />
                        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4" />
                      </div>
                    </label>
                  ))}
                </div>

                <Field label="Cancellation policy">
                  <select {...register('cancellation_policy')} className={selectCls}>
                    <option value="free_24h">Free cancellation up to 24 hours before</option>
                    <option value="free_48h">Free cancellation up to 48 hours before</option>
                    <option value="partial_24h">50% refund if cancelled within 24 hours</option>
                    <option value="no_refund">No cancellation / No refund</option>
                  </select>
                </Field>
              </div>
            </StepCard>
          )}

          {/* ── Step 8: Availability ──────────────────────────── */}
          {step === 8 && (
            <StepCard title="Availability" icon="📅" subtitle="When is your studio open for bookings?">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Working days</label>
                  <div className="flex gap-2">
                    {DAYS.map(day => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all
                          ${watchWorkingDays.includes(day) ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                        {DAY_LABELS[day]}
                      </button>
                    ))}
                  </div>
                  {errors.working_days && (
                    <p className="text-red-500 text-xs mt-1">{errors.working_days.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Opening time">
                    <input {...register('opening_time')} type="time" className={inputCls} />
                  </Field>
                  <Field label="Closing time">
                    <input {...register('closing_time')} type="time" className={inputCls} />
                  </Field>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                  📅 You can block specific dates (holidays, maintenance) from your dashboard after going live.
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Step 9: Payout ────────────────────────────────── */}
          {step === 9 && (
            <StepCard title="Payout Details" icon="🏦" subtitle="Where should we send your earnings?">
              <div className="space-y-4">
                <Field label="Account holder name">
                  <input {...register('bank_account_name')} placeholder="As per bank records" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Bank account number" span={2}>
                    <input {...register('account_number')} type="text" placeholder="XXXX XXXX XXXX XXXX" className={inputCls} />
                  </Field>
                  <Field label="IFSC code" error={errors.ifsc?.message}>
                    <input {...register('ifsc')} placeholder="HDFC0001234" className={`${inputCls} uppercase`} />
                  </Field>
                  <Field label="UPI ID (optional)">
                    <input {...register('upi_id')} placeholder="name@upi" className={inputCls} />
                  </Field>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 space-y-1">
                  <div className="font-semibold">How payouts work</div>
                  <div>• Studio District deducts 10% platform commission</div>
                  <div>• Remaining amount sent T+1 business day after booking completes</div>
                  <div>• Bank transfer or UPI — your choice</div>
                  <div>• GST TDS deducted as per applicable rates</div>
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Step 10: Review & Submit ──────────────────────── */}
          {step === 10 && (
            <StepCard title="Ready to go live!" icon="🚀" subtitle="Review your submission before we send it for approval">
              <div className="space-y-4">
                <ReviewRow label="Studio name" value={getValues('studio_name')} />
                <ReviewRow label="Type" value={getValues('studio_type')} />
                <ReviewRow label="Area" value={getValues('area')} />
                <ReviewRow label="Price / hour" value={`₹${getValues('price_per_hour')?.toLocaleString('en-IN') || '—'}`} />
                <ReviewRow label="WhatsApp" value={`+91 ${getValues('owner_phone')}`} />

                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="text-sm font-semibold text-green-700 mb-2">✅ What happens next</div>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>1. Our team reviews your listing within 24–48 hours</li>
                    <li>2. You&apos;ll receive a WhatsApp confirmation once live</li>
                    <li>3. Your studio goes live and starts receiving bookings</li>
                    <li>4. You can update photos and details any time</li>
                  </ul>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-4 rounded-xl bg-brand-500 text-white font-bold text-base hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Submitting…' : 'Submit for Review 🚀'}
                </button>
              </div>
            </StepCard>
          )}

          {/* Navigation */}
          {step < 10 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
              )}
              <button type="button" onClick={handleNext}
                className={`${step > 1 ? 'flex-[2]' : 'flex-1'} py-3.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors`}>
                {step === 9 ? 'Review submission →' : 'Next →'}
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────
function StepCard({ title, icon, subtitle, children }: { title: string; icon: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, error, children, span, className }: { label: string; error?: string; children: React.ReactNode; span?: number; className?: string }) {
  return (
    <div className={`${span === 2 ? 'col-span-2' : ''} ${className || ''}`}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function ImageUploadZone({
  label, sublabel, icon, hint,
  imageType, images, onAdd, onRemove,
  accept = 'image/*', multiple = false, resourceType = 'image',
}: {
  label: string; sublabel: string; icon: string; hint?: string
  imageType: string
  images: UploadedImage[]
  onAdd: (imgs: UploadedImage[]) => void
  onRemove: (cloudinaryId: string) => void
  accept?: string
  multiple?: boolean
  resourceType?: 'image' | 'video'
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    const results: UploadedImage[] = []
    try {
      for (const file of Array.from(files)) {
        const signRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'framr/studios' }),
        })
        if (!signRes.ok) {
          toast.error('Cloudinary not configured yet. Add your API keys to .env.local.')
          break
        }
        const { cloud_name, upload_preset } = await signRes.json()

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', upload_preset)

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`,
          { method: 'POST', body: formData }
        )
        const uploadData = await uploadRes.json()

        if (uploadData.secure_url) {
          results.push({ url: uploadData.secure_url, cloudinary_id: uploadData.public_id, image_type: imageType })
        } else {
          const msg = uploadData.error?.message || 'Unknown error'
          console.error('Cloudinary upload error:', uploadData)
          toast.error(`Upload failed: ${msg}`)
        }
      }
      if (results.length > 0) onAdd(results)
    } catch (err) {
      console.error('Upload exception:', err)
      toast.error('Upload failed. Check your internet connection.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
          ${uploading ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!uploading && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={e => e.target.files?.length && handleFiles(e.target.files)} />
        {uploading ? (
          <div className="space-y-2">
            <div className="text-2xl">⏳</div>
            <div className="text-sm text-brand-600 font-medium">Uploading…</div>
          </div>
        ) : (
          <>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="font-medium text-gray-700 text-sm mb-0.5">{label}</div>
            <div className="text-xs text-gray-400 mb-1">{sublabel}</div>
            <div className="text-xs text-brand-400">Click or drag &amp; drop to upload</div>
            {hint && <div className="text-xs text-blue-500 mt-1">{hint}</div>}
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {images.map(img => (
            <div key={img.cloudinary_id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group flex-shrink-0">
              {img.image_type === 'video'
                ? <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">🎬</div>
                : <img src={img.url} alt="" className="w-full h-full object-cover" />
              }
              <button type="button" onClick={() => onRemove(img.cloudinary_id)}
                className="absolute inset-0 bg-black/50 text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value || '—'}</span>
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all placeholder:text-gray-300'
const selectCls = `${inputCls} appearance-none bg-white`
const prefixCls = 'flex items-center px-4 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500 font-medium'
