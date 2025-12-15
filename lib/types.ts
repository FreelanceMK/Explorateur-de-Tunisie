export interface Place {
  title: string
  address: string
  category: string
  governorate: string
  latitude: number
  longitude: number
  rating: number
  reviews: number
  phoneNumber?: string
  website?: string
  cid?: string
  placeId?: string
  openingHours?: string[] | Record<string, string>
  priceRange?: string
  position: number
  grid_lat?: number
  grid_lng?: number
  type?: string
  types?: string[]
  ratingCount?: number
  thumbnailUrl?: string
  fid?: string
}

export interface FilterState {
  search: string
  categories: string[]
  governorates: string[]
  ratingMin: number
  ratingMax: number
  reviewsMin: number
  reviewsMax: number
  hasPhone: boolean
  hasWebsite: boolean
}

export type SortField = "title" | "rating" | "reviews"
export type SortDirection = "asc" | "desc"

export interface SortState {
  field: SortField
  direction: SortDirection
}
