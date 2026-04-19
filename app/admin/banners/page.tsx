'use client'
// app/admin/banners/page.tsx
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Banner } from '@/types/database.types'

const TYPE_ICON: Record<string, string> = { announcement: '📢', offer: '🎁', feature: '✨', referral: '🎁' }
const TYPE_COLOR: Record<string, string> = {
  announcement: '#dbeafe',
  offer: '#dcfce7',
  feature: '#f3e8ff',
  referral: '#fef9c3',
}
const TYPE_TEXT: Record<string, string> = {
  announcement: '#1d4ed8',
  offer: '#15803d',
  feature: '#7e22ce',
  referral: '#92400e',
}

const DEFAULT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  announcement: { bg: '#111827', text: '#ffffff', accent: '#84cc16' },
  offer:        { bg: '#0f2a0f', text: '#ffffff', accent: '#84cc16' },
  feature:      { bg: '#0f172a', text: '#ffffff', accent: '#84cc16' },
  referral:     { bg: '#f0fdf4', text: '#111827', accent: '#84cc16' },
}

type FormState = {
  type: 'announcement' | 'offer' | 'feature' | 'referral'
  title: string
  body: string
  cta_label: string
  cta_url: string
  show_to: 'all' | 'logged_in' | 'logged_out'
  starts_at: string
  ends_at: string
  is_active: boolean
  is_dismissable: boolean
  bg_color: string
  text_color: string
  accent_color: string
  display_order: number
  referral_amount: number
}

const emptyForm = (): FormState => ({
  type: 'announcement',
  title: '',
  body: '',
  cta_label: '',
  cta_url: '',
  show_to: 'all',
  starts_at: '',
  ends_at: '',
  is_active: true,
  is_dismissable: true,
  bg_color: '#111827',
  text_color: '#ffffff',
  accent_color: '#84cc16',
  display_order: 0,
  referral_amount: 200,
})

function statusInfo(banner: Banner): { label: string; color: string; textColor: string } {
  const now = new Date()
  if (!banner.is_active) return { label: 'Draft', color: '#f1f5f9', textColor: '#64748b' }
  if (banner.ends_at && new Date(banner.ends_at) <= now) return { label: 'Expired', color: '#fee2e2', textColor: '#dc2626' }
  if (banner.starts_at && new Date(banner.starts_at) > now) return { label: 'Scheduled', color: '#fef3c7', textColor: '#d97706' }
  return { label: 'Active', color: '#dcfce7', textColor: '#16a34a' }
}

export default function AdminBannersPage() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [referralAmount, setReferralAmount] = useState(200)
  const [referralSaving, setReferralSaving] = useState(false)

  // Auth guard
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login?next=/admin/banners'); return }
      const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
      if (!admin) router.push('/')
    })
  }, [router])

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/banners')
    const data = await res.json()
    const all: Banner[] = data.banners ?? []
    setBanners(all)
    const rb = all.find(b => b.type === 'referral')
    if (rb?.referral_amount) setReferralAmount(rb.referral_amount)
    setLoading(false)
  }, [])

  useEffect(() => { fetchBanners() }, [fetchBanners])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(banner: Banner) {
    setEditingId(banner.id)
    setForm({
      type: banner.type,
      title: banner.title,
      body: banner.body ?? '',
      cta_label: banner.cta_label ?? '',
      cta_url: banner.cta_url ?? '',
      show_to: banner.show_to,
      starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : '',
      ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : '',
      is_active: banner.is_active,
      is_dismissable: banner.is_dismissable,
      bg_color: banner.bg_color,
      text_color: banner.text_color,
      accent_color: banner.accent_color,
      display_order: banner.display_order,
      referral_amount: banner.referral_amount ?? 200,
    })
    setModalOpen(true)
  }

  async function saveForm() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        body: form.body || null,
        cta_label: form.cta_label || null,
        cta_url: form.cta_url || null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        referral_amount: form.type === 'referral' ? (form.referral_amount || 200) : null,
      }
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(editingId ? 'Banner updated' : 'Banner created')
      setModalOpen(false)
      fetchBanners()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(banner: Banner) {
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !banner.is_active }),
    })
    if (res.ok) {
      setBanners(bs => bs.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      toast.success(banner.is_active ? 'Banner deactivated' : 'Banner activated')
    }
  }

  async function deleteBanner(id: string) {
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBanners(bs => bs.filter(b => b.id !== id))
      setDeleteConfirm(null)
      toast.success('Banner deleted')
    }
  }

  async function saveReferralAmount() {
    const rb = banners.find(b => b.type === 'referral')
    if (!rb) { toast.error('No referral banner found'); return }
    setReferralSaving(true)
    const res = await fetch(`/api/admin/banners/${rb.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'referral', referral_amount: referralAmount }),
    })
    setReferralSaving(false)
    if (res.ok) toast.success('Referral reward updated')
    else toast.error('Failed to update')
    fetchBanners()
  }

  function setFormField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'type') {
        const defaults = DEFAULT_COLORS[value as string]
        next.bg_color = defaults.bg
        next.text_color = defaults.text
        next.accent_color = defaults.accent
      }
      return next
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.03em' }}>
            <span style={{ color: '#0f172a' }}>Studio</span><span style={{ color: '#84cc16' }}>District</span>
          </span>
          <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700' }}>Admin</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
          <Link href="/admin" style={{ color: '#6b7280', textDecoration: 'none' }}>Overview</Link>
          <Link href="/admin/studios" style={{ color: '#6b7280', textDecoration: 'none' }}>Studios</Link>
          <Link href="/admin/bookings" style={{ color: '#6b7280', textDecoration: 'none' }}>Bookings</Link>
          <Link href="/admin/banners" style={{ color: '#84cc16', fontWeight: '600', textDecoration: 'none' }}>Banners</Link>
          <Link href="/admin/payments" style={{ color: '#6b7280', textDecoration: 'none' }}>Payments</Link>
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>← Site</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>Banners</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Manage homepage announcements, offers, and feature cards</p>
          </div>
          <button
            onClick={openCreate}
            style={{
              padding: '10px 18px', borderRadius: '10px', backgroundColor: '#84cc16',
              color: '#111827', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer',
            }}
          >
            + New Banner
          </button>
        </div>

        {/* Referral reward quick-set */}
        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>🎁 Referral reward amount</div>
            <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '2px' }}>Both referrer and new user earn this on first booking</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #bbf7d0', padding: '8px 12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>₹</span>
              <input
                type="number"
                min={1}
                value={referralAmount}
                onChange={e => setReferralAmount(Number(e.target.value))}
                style={{ width: '80px', border: 'none', outline: 'none', fontSize: '18px', fontWeight: '700', color: '#111827', background: 'transparent' }}
              />
            </div>
            <button
              onClick={saveReferralAmount}
              disabled={referralSaving}
              style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', opacity: referralSaving ? 0.6 : 1 }}
            >
              {referralSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Banner table */}
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
          ) : banners.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>No banners yet. Create your first one.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Type', 'Title', 'Audience', 'Status', 'Dates', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {banners.map(banner => {
                  const status = statusInfo(banner)
                  return (
                    <tr key={banner.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: TYPE_COLOR[banner.type], color: TYPE_TEXT[banner.type],
                        }}>
                          {TYPE_ICON[banner.type]} {banner.type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{banner.title}</div>
                        {banner.type === 'referral' && banner.referral_amount
                          ? <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>₹{banner.referral_amount} reward per referral</div>
                          : banner.body && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.body}</div>
                        }
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>{banner.show_to}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: status.color, color: status.textColor,
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b7280' }}>
                        {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        {' → '}
                        {banner.ends_at ? new Date(banner.ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '∞'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Toggle active */}
                          <button
                            onClick={() => toggleActive(banner)}
                            title={banner.is_active ? 'Deactivate' : 'Activate'}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer',
                              backgroundColor: banner.is_active ? '#fef9c3' : '#dcfce7',
                              color: banner.is_active ? '#854d0e' : '#15803d',
                            }}
                          >
                            {banner.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(banner)}
                            style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          {/* Delete */}
                          {deleteConfirm === banner.id ? (
                            <>
                              <button
                                onClick={() => deleteBanner(banner.id)}
                                style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', backgroundColor: '#fecaca', color: '#dc2626', cursor: 'pointer' }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{ padding: '5px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(banner.id)}
                              style={{ padding: '5px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #fecaca', backgroundColor: '#fff', color: '#dc2626', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '20px',
        }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div style={{
            backgroundColor: '#fff', borderRadius: '18px', padding: '28px',
            width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {editingId ? 'Edit Banner' : 'New Banner'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type */}
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={e => {
                  const t = e.target.value as FormState['type']
                  setFormField('type', t)
                  const c = DEFAULT_COLORS[t]
                  if (c) { setFormField('bg_color', c.bg); setFormField('text_color', c.text); setFormField('accent_color', c.accent) }
                }} style={inputStyle}>
                  <option value="announcement">📢 Announcement</option>
                  <option value="offer">🎁 Offer</option>
                  <option value="feature">✨ Feature</option>
                  <option value="referral">🎁 Referral</option>
                </select>
              </div>

              {/* Referral amount — only for referral type */}
              {form.type === 'referral' && (
                <div>
                  <label style={labelStyle}>Referral reward amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.referral_amount}
                    onChange={e => setFormField('referral_amount', Number(e.target.value))}
                    placeholder="200"
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Both the referrer and the new user get this amount credited to their wallet.
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input value={form.title} onChange={e => setFormField('title', e.target.value)} placeholder="e.g. Studio District is live in Chennai!" style={inputStyle} />
              </div>

              {/* Body */}
              {form.type !== 'referral' && (
                <div>
                  <label style={labelStyle}>Body text</label>
                  <textarea value={form.body} onChange={e => setFormField('body', e.target.value)} rows={3} placeholder="Optional supporting text…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              )}

              {/* CTA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>CTA Label</label>
                  <input value={form.cta_label} onChange={e => setFormField('cta_label', e.target.value)} placeholder="Browse studios" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CTA URL</label>
                  <input value={form.cta_url} onChange={e => setFormField('cta_url', e.target.value)} placeholder="/" style={inputStyle} />
                </div>
              </div>

              {/* Show to + order */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Show to</label>
                  <select value={form.show_to} onChange={e => setFormField('show_to', e.target.value as any)} style={inputStyle}>
                    <option value="all">Everyone</option>
                    <option value="logged_in">Logged in only</option>
                    <option value="logged_out">Logged out only</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Display order</label>
                  <input type="number" value={form.display_order} onChange={e => setFormField('display_order', Number(e.target.value))} min={0} style={inputStyle} />
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Starts at</label>
                  <input type="datetime-local" value={form.starts_at} onChange={e => setFormField('starts_at', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ends at (blank = no expiry)</label>
                  <input type="datetime-local" value={form.ends_at} onChange={e => setFormField('ends_at', e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '24px' }}>
                {([
                  { key: 'is_active', label: 'Active' },
                  { key: 'is_dismissable', label: 'Dismissable' },
                ] as { key: keyof FormState; label: string }[]).map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={e => setFormField(key, e.target.checked as any)}
                      style={{ width: '16px', height: '16px', accentColor: '#84cc16' }}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Colours */}
              <div>
                <label style={labelStyle}>Preview colours</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {([
                    { key: 'bg_color', label: 'Background' },
                    { key: 'text_color', label: 'Text' },
                    { key: 'accent_color', label: 'Accent' },
                  ] as { key: keyof FormState; label: string }[]).map(({ key, label }) => (
                    <div key={key}>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>{label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 10px' }}>
                        <input
                          type="color"
                          value={form[key] as string}
                          onChange={e => setFormField(key, e.target.value as any)}
                          style={{ width: '24px', height: '24px', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '4px' }}
                        />
                        <span style={{ fontSize: '12px', color: '#374151', fontFamily: 'monospace' }}>{form[key] as string}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mini preview */}
                <div style={{
                  marginTop: '10px', padding: '12px 16px', borderRadius: '10px',
                  backgroundColor: form.bg_color, color: form.text_color, fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span>{TYPE_ICON[form.type]}</span>
                  <span style={{ fontWeight: '600' }}>{form.title || 'Preview title'}</span>
                  {form.cta_label && (
                    <span style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '6px', backgroundColor: form.accent_color, color: '#111827', fontWeight: '700', fontSize: '12px' }}>
                      {form.cta_label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                disabled={saving}
                style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#84cc16', color: '#111827', fontWeight: '700', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
