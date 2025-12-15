"use client"

import { Star, Phone, Globe, MapPin, ChevronLeft, ChevronRight, MapPinOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, CATEGORY_IMAGES } from "@/lib/constants"
import type { Place } from "@/lib/types"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"

interface PlacesGridProps {
  places: Place[]
  isLoading: boolean
  onPlaceClick: (place: Place) => void
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export function PlacesGrid({
  places,
  isLoading,
  onPlaceClick,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: PlacesGridProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3 w-3",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
          <MapPinOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{t('grid.noResults')}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {t('grid.noResultsDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {places.map((place, index) => {
          const categoryColors = CATEGORY_COLORS[place.category] || DEFAULT_CATEGORY_COLOR
          const fallbackImage = CATEGORY_IMAGES[place.category] || CATEGORY_IMAGES["Restaurant"]
          const thumbnailUrl = place.thumbnailUrl || fallbackImage
          
          // Generate stable unique key for React
          const uniqueKey = place.placeId || place.cid || place.fid || `${index}-${place.title}`

          return (
            <Card
              key={uniqueKey}
              className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group p-0"
              onClick={() => onPlaceClick(place)}
            >
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={thumbnailUrl || "/placeholder.svg"}
                  alt={place.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (target.src !== fallbackImage) {
                      target.src = fallbackImage
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <Badge
                  variant="secondary"
                  className={cn("absolute top-3 left-3 font-normal", categoryColors.bg, categoryColors.text)}
                >
                  {place.category}
                </Badge>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1 text-white">
                    {renderStars(place.rating || 0)}
                    <span className="ml-1 text-sm font-medium">{place.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-white/70">({(place.reviews || 0).toLocaleString()})</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-3 space-y-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {place.title}
                  </h3>
                  <div className="flex items-start gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground line-clamp-2">{place.address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-normal text-xs">
                    {place.governorate}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {place.phoneNumber && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`tel:${place.phoneNumber}`)
                        }}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {place.website && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(place.website, "_blank")
                        }}
                      >
                        <Globe className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <span>{t('grid.showingResults', { count: itemsPerPage.toString(), total: totalItems.toString() })}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
