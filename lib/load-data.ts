import type { Place } from "./types"
import placesData from "@/data.json"

interface RawPlace {
  position: number
  title: string
  address: string
  latitude: number
  longitude: number
  rating: number
  ratingCount?: number
  type?: string
  types?: string[]
  phoneNumber?: string
  website?: string
  openingHours?: Record<string, string>
  thumbnailUrl?: string
  cid?: string
  fid?: string
  placeId?: string
  category: string
  governorate: string
  grid_lat?: number
  grid_lng?: number
}

// Chunk size for initial load
const INITIAL_CHUNK_SIZE = 1000
const CHUNK_SIZE = 500

let allPlaces: Place[] = []
let isFullyLoaded = false

function transformPlace(item: RawPlace): Place {
  return {
    title: item.title,
    address: item.address,
    category: item.category || item.type || "Unknown",
    governorate: item.governorate,
    latitude: item.latitude,
    longitude: item.longitude,
    rating: item.rating,
    reviews: item.ratingCount || 0,
    phoneNumber: item.phoneNumber,
    website: item.website,
    placeId: item.placeId,
    cid: item.cid?.toString(),
    fid: item.fid,
    openingHours: item.openingHours,
    position: item.position,
    grid_lat: item.grid_lat,
    grid_lng: item.grid_lng,
    type: item.type,
    types: item.types,
    ratingCount: item.ratingCount,
    thumbnailUrl: item.thumbnailUrl,
  }
}

/**
 * Load all places data for proper filtering and searching
 * Deduplicates entries using placeId, cid, fid, or normalized title+address+coordinates
 */
export function loadPlacesFromData(): Place[] {
  if (allPlaces.length > 0) {
    return allPlaces
  }

  const data = placesData as RawPlace[]
  const totalRecords = data.length
  
  console.log(`📊 Total records in data: ${totalRecords.toLocaleString()}`)
  
  // Use Map for deduplication - keep first occurrence
  const uniquePlaces = new Map<string, Place>()
  
  data.forEach(item => {
    const place = transformPlace(item)
    
    // Generate stable unique key (same priority as React key)
    const uniqueKey = place.placeId || 
                      place.cid || 
                      place.fid ||
                      `${place.title.trim().toLowerCase()}|${place.address.trim().toLowerCase()}|${place.latitude}|${place.longitude}`
    
    // Keep first occurrence only
    if (!uniquePlaces.has(uniqueKey)) {
      uniquePlaces.set(uniqueKey, place)
    }
  })
  
  allPlaces = Array.from(uniquePlaces.values())
  isFullyLoaded = true
  
  const duplicatesRemoved = totalRecords - allPlaces.length
  console.log(`✅ Loaded ${allPlaces.length.toLocaleString()} unique places (removed ${duplicatesRemoved.toLocaleString()} duplicates)`)
  
  return allPlaces
}

/**
 * Load more places data in chunks (for lazy loading)
 */
export function loadMorePlaces(): { places: Place[]; hasMore: boolean } {
  if (isFullyLoaded) {
    return { places: allPlaces, hasMore: false }
  }

  const data = placesData as RawPlace[]
  const currentLength = allPlaces.length
  const totalRecords = data.length
  
  const nextChunk = data.slice(currentLength, currentLength + CHUNK_SIZE)
  const newPlaces = nextChunk.map(transformPlace)
  
  allPlaces = [...allPlaces, ...newPlaces]
  
  console.log(`📦 Loaded ${newPlaces.length} more places. Total: ${allPlaces.length.toLocaleString()}`)
  
  if (allPlaces.length >= totalRecords) {
    isFullyLoaded = true
  }
  
  return {
    places: allPlaces,
    hasMore: !isFullyLoaded,
  }
}

/**
 * Get current load status
 */
export function getLoadStatus(): { loaded: number; total: number; isComplete: boolean } {
  const data = placesData as RawPlace[]
  const totalRecords = data.length
  
  return {
    loaded: allPlaces.length,
    total: totalRecords,
    isComplete: isFullyLoaded,
  }
}

/**
 * Reset loaded data (useful for testing)
 */
export function resetLoadedData(): void {
  allPlaces = []
  isFullyLoaded = false
}
