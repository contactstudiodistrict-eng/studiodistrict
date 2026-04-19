// components/filters/types.ts

export interface FilterState {
  types: string[]
  areas: string[]
  priceMin: number | null
  priceMax: number | null
  amenities: string[]
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

export const DEFAULT_FILTERS: FilterState = {
  types: [],
  areas: [],
  priceMin: null,
  priceMax: null,
  amenities: [],
  sortBy: 'recommended',
}

export const STUDIO_TYPE_OPTIONS = [
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'videography', label: 'Video',        icon: '🎬' },
  { value: 'audio',       label: 'Podcast',      icon: '🎙' },
  { value: 'music',       label: 'Music',        icon: '🎵' },
  { value: 'mixed',       label: 'Multi-use',    icon: '🎭' },
]

export const AMENITY_OPTIONS = [
  { key: 'ac',            label: 'AC' },
  { key: 'wifi',          label: 'WiFi' },
  { key: 'parking',       label: 'Free parking' },
  { key: 'power_backup',  label: 'Power backup' },
  { key: 'natural_light', label: 'Natural light' },
  { key: 'makeup_room',   label: 'Makeup room' },
  { key: 'changing_room', label: 'Changing room' },
  { key: 'props',         label: 'Props available' },
  { key: 'elevator',      label: 'Elevator' },
  { key: 'waiting_area',  label: 'Waiting area' },
]

export const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc',   label: 'Price: low to high' },
  { value: 'price_desc',  label: 'Price: high to low' },
  { value: 'rating',      label: 'Highest rated' },
  { value: 'newest',      label: 'Newest' },
]

export const ALL_AREAS = [
  'Velachery', 'OMR', 'Anna Nagar', 'T.Nagar', 'Adyar',
  'Sholinganallur', 'Porur', 'Vadapalani', 'Mylapore', 'Tambaram',
  'Nungambakkam', 'ECR', 'Perambur', 'Guindy',
]

export function parseFiltersFromParams(params: Record<string, string | undefined>): FilterState {
  const typeParam    = params.type    || ''
  const areaParam    = params.area    || ''
  const amenityParam = params.amenity || ''
  const sortParam    = params.sort    || 'recommended'
  const pmin = params.pmin ? Number(params.pmin) : null
  const pmax = params.pmax ? Number(params.pmax) : null

  const validSorts: FilterState['sortBy'][] = ['recommended', 'price_asc', 'price_desc', 'rating', 'newest']

  return {
    types:    typeParam    ? typeParam.split(',').filter(Boolean)    : [],
    areas:    areaParam    ? areaParam.split(',').filter(Boolean)    : [],
    amenities: amenityParam ? amenityParam.split(',').filter(Boolean) : [],
    priceMin: pmin,
    priceMax: pmax,
    sortBy:   validSorts.includes(sortParam as FilterState['sortBy'])
      ? (sortParam as FilterState['sortBy'])
      : 'recommended',
  }
}

export function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.types.length)     params.set('type',    filters.types.join(','))
  if (filters.areas.length)     params.set('area',    filters.areas.join(','))
  if (filters.amenities.length) params.set('amenity', filters.amenities.join(','))
  if (filters.priceMin != null) params.set('pmin',    String(filters.priceMin))
  if (filters.priceMax != null) params.set('pmax',    String(filters.priceMax))
  if (filters.sortBy !== 'recommended') params.set('sort', filters.sortBy)
  return params
}

export function countActiveFilters(filters: FilterState): number {
  let n = 0
  if (filters.types.length)     n++
  if (filters.areas.length)     n++
  if (filters.amenities.length) n++
  if (filters.priceMin != null || filters.priceMax != null) n++
  return n
}

export function applyFilters(studios: any[], filters: FilterState): any[] {
  return studios.filter(s => {
    if (filters.types.length > 0 && !filters.types.includes(s.studio_type)) return false
    if (filters.areas.length > 0 && !filters.areas.includes(s.area?.toLowerCase())) return false
    if (filters.priceMin != null && s.price_per_hour < filters.priceMin) return false
    if (filters.priceMax != null && s.price_per_hour > filters.priceMax) return false
    if (filters.amenities.length > 0) {
      const a = s.studio_amenities
      if (!a) return false
      if (!filters.amenities.every(key => a[key] === true)) return false
    }
    return true
  })
}

export function applySort(studios: any[], sortBy: FilterState['sortBy']): any[] {
  return [...studios].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':  return a.price_per_hour - b.price_per_hour
      case 'price_desc': return b.price_per_hour - a.price_per_hour
      case 'rating':     return (b.rating || 0) - (a.rating || 0) || (b.review_count || 0) - (a.review_count || 0)
      case 'newest':     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'recommended':
      default: {
        const fa = a.is_featured ? 0 : 1
        const fb = b.is_featured ? 0 : 1
        if (fa !== fb) return fa - fb
        return (b.rating || 0) - (a.rating || 0)
      }
    }
  })
}
