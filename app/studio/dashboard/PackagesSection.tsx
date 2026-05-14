'use client'
import { useState } from 'react'
import { formatINR } from '@/lib/pricing'

interface Package {
  id: string
  package_name: string
  description: string | null
  duration_hours: number
  price: number
  original_price: number | null
  included_equipment: string[] | null
  included_amenities: string[] | null
  included_extras: string[] | null
  max_people: number | null
  rules: string | null
  badge_text: string | null
  is_active: boolean
  display_order: number
}

interface Props {
  studioId: string
  initialPackages: Package[]
  amenityOptions: string[]
  equipmentOptions: string[]
}

const BADGE_OPTIONS = ['', 'Most Popular', 'Best Value', 'Premium', 'New']

const EMPTY_FORM = {
  package_name: '', description: '', duration_hours: '', price: '',
  original_price: '', max_people: '', badge_text: '', rules: '',
  included_equipment: [] as string[], included_amenities: [] as string[],
  included_extras: [''] as string[],
}

export function PackagesSection({ studioId, initialPackages, amenityOptions, equipmentOptions }: Props) {
  const [packages, setPackages] = useState<Package[]>(initialPackages)
  const [showModal, setShowModal] = useState(false)
  const [editPkg, setEditPkg]     = useState<Package | null>(null)
  const [form, setForm]           = useState({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast]         = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openAdd() {
    setEditPkg(null)
    setForm({ ...EMPTY_FORM })
    setFormError('')
    setShowModal(true)
  }

  function openEdit(pkg: Package) {
    setEditPkg(pkg)
    setForm({
      package_name:       pkg.package_name,
      description:        pkg.description ?? '',
      duration_hours:     String(pkg.duration_hours),
      price:              String(pkg.price),
      original_price:     String(pkg.original_price ?? ''),
      max_people:         String(pkg.max_people ?? ''),
      badge_text:         pkg.badge_text ?? '',
      rules:              pkg.rules ?? '',
      included_equipment: pkg.included_equipment ?? [],
      included_amenities: pkg.included_amenities ?? [],
      included_extras:    pkg.included_extras?.length ? pkg.included_extras : [''],
    })
    setFormError('')
    setShowModal(true)
  }

  function closeModal() { setShowModal(false); setEditPkg(null) }

  function toggleCheck(key: 'included_equipment' | 'included_amenities', item: string) {
    setForm(f => {
      const arr = f[key]
      return { ...f, [key]: arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item] }
    })
  }

  function setExtra(i: number, val: string) {
    setForm(f => { const ex = [...f.included_extras]; ex[i] = val; return { ...f, included_extras: ex } })
  }
  function addExtra() { setForm(f => ({ ...f, included_extras: [...f.included_extras, ''] })) }
  function removeExtra(i: number) { setForm(f => ({ ...f, included_extras: f.included_extras.filter((_, idx) => idx !== i) })) }

  async function save() {
    setFormError('')
    if (!form.package_name.trim() || form.package_name.length < 2)
      return setFormError('Package name must be at least 2 characters')
    if (!form.duration_hours || Number(form.duration_hours) <= 0)
      return setFormError('Duration must be greater than 0')
    if (!form.price || Number(form.price) <= 0)
      return setFormError('Price must be greater than 0')
    if (form.original_price && Number(form.original_price) <= Number(form.price))
      return setFormError('Original price must be greater than sale price')

    setSaving(true)
    const payload = {
      package_name:       form.package_name.trim(),
      description:        form.description.trim() || null,
      duration_hours:     Number(form.duration_hours),
      price:              Number(form.price),
      original_price:     form.original_price ? Number(form.original_price) : null,
      included_equipment: form.included_equipment,
      included_amenities: form.included_amenities,
      included_extras:    form.included_extras.filter(e => e.trim()),
      max_people:         form.max_people ? Number(form.max_people) : null,
      badge_text:         form.badge_text || null,
      rules:              form.rules.trim() || null,
    }

    try {
      const url    = editPkg
        ? `/api/studios/${studioId}/packages/${editPkg.id}`
        : `/api/studios/${studioId}/packages`
      const method = editPkg ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d      = await res.json()
      if (!res.ok) { setFormError(d.error || 'Save failed'); return }

      if (editPkg) {
        setPackages(prev => prev.map(p => p.id === editPkg.id ? d.package : p))
      } else {
        setPackages(prev => [...prev, d.package])
      }
      showToast('Package saved!')
      closeModal()
    } catch { setFormError('Network error. Try again.') }
    finally { setSaving(false) }
  }

  async function toggleActive(pkg: Package) {
    const newActive = !pkg.is_active
    const method = newActive ? 'PATCH' : 'DELETE'
    const url    = newActive
      ? `/api/studios/${studioId}/packages/${pkg.id}`
      : `/api/studios/${studioId}/packages/${pkg.id}`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: newActive ? JSON.stringify({ is_active: true }) : undefined,
    })
    if (res.ok) {
      setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, is_active: newActive } : p))
      showToast(newActive ? 'Package reactivated' : 'Package deactivated')
    }
  }

  const input: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const label: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '5px' }

  return (
    <section className="mb-8">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#111827', color: '#84cc16', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          ✓ {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700">📦 My Packages</h2>
        <button onClick={openAdd}
          className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors">
          + Add Package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-100 py-8 text-center px-6">
          <div className="text-3xl mb-2">📦</div>
          <p className="text-sm text-gray-500 mb-3">No packages yet. Create a package to offer customers a better deal.</p>
          <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600">Create first package</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {packages.map(pkg => (
            <div key={pkg.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{pkg.package_name}</span>
                  {pkg.badge_text && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">{pkg.badge_text}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {pkg.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {formatINR(pkg.price)} · {pkg.duration_hours} hrs{pkg.original_price ? ` · was ${formatINR(pkg.original_price)}` : ''}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(pkg)}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">Edit</button>
                <button onClick={() => toggleActive(pkg)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium ${pkg.is_active ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                  {pkg.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden">
            <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
              <div className="text-white font-semibold">{editPkg ? 'Edit Package' : 'Add New Package'}</div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#dc2626' }}>{formError}</div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                <div>
                  <label style={label}>Package name *</label>
                  <input style={input} value={form.package_name} onChange={e => setForm(f => ({ ...f, package_name: e.target.value }))} placeholder="Half Day Shoot" />
                </div>
                <div>
                  <label style={label}>Description</label>
                  <textarea style={{ ...input, resize: 'none' }} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Perfect for portrait sessions…" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={label}>Duration (hours) *</label>
                    <input style={input} type="number" min={1} value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} placeholder="4" />
                  </div>
                  <div>
                    <label style={label}>Price (₹) *</label>
                    <input style={input} type="number" min={1} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="4000" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={label}>Original price (₹) <span style={{ fontWeight: 400, textTransform: 'none' }}>— shows savings</span></label>
                    <input style={input} type="number" min={1} value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="4800" />
                  </div>
                  <div>
                    <label style={label}>Max people</label>
                    <input style={input} type="number" min={1} value={form.max_people} onChange={e => setForm(f => ({ ...f, max_people: e.target.value }))} placeholder="5" />
                  </div>
                </div>
              </div>

              {/* Equipment */}
              {equipmentOptions.length > 0 && (
                <div>
                  <label style={label}>Included Equipment</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {equipmentOptions.map(item => (
                      <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.included_equipment.includes(item)}
                          onChange={() => toggleCheck('included_equipment', item)} style={{ accentColor: '#84cc16' }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {amenityOptions.length > 0 && (
                <div>
                  <label style={label}>Included Amenities</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {amenityOptions.map(item => (
                      <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.included_amenities.includes(item)}
                          onChange={() => toggleCheck('included_amenities', item)} style={{ accentColor: '#84cc16' }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras */}
              <div>
                <label style={label}>Extras <span style={{ fontWeight: 400, textTransform: 'none' }}>— custom items</span></label>
                {form.included_extras.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input style={{ ...input, flex: 1 }} value={ex} onChange={e => setExtra(i, e.target.value)} placeholder="Free parking, Props library access…" />
                    {form.included_extras.length > 1 && (
                      <button onClick={() => removeExtra(i)} style={{ padding: '0 10px', border: '1px solid #fecaca', borderRadius: '8px', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                    )}
                  </div>
                ))}
                <button onClick={addExtra} style={{ fontSize: '12px', color: '#84cc16', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                  + Add extra
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={label}>Badge</label>
                  <select style={{ ...input, background: '#fff', appearance: 'none' }} value={form.badge_text} onChange={e => setForm(f => ({ ...f, badge_text: e.target.value }))}>
                    {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Package rules</label>
                  <input style={input} value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} placeholder="No outside equipment…" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button onClick={closeModal}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '500', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', background: saving ? '#d9f99d' : '#84cc16', color: '#111827', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? 'Saving…' : '✓ Save Package'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
