"use client"

import { X, Star, Phone, Globe, Copy, MapPin, Clock, DollarSign, ExternalLink, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants"
import type { Place } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { t } from "@/lib/translations"

interface PlaceDetailsModalProps {
  place: Place | null
  isOpen: boolean
  onClose: () => void
  nearbyPlaces: Place[]
}

export function PlaceDetailsModal({ place, isOpen, onClose, nearbyPlaces }: PlaceDetailsModalProps) {
  if (!place) return null

  const categoryColors = CATEGORY_COLORS[place.category] || DEFAULT_CATEGORY_COLOR

  const copyAddress = () => {
    navigator.clipboard.writeText(place.address)
    toast.success(t('placeDetails.addressCopied'))
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      place.title + " " + place.address,
    )}`
    window.open(url, "_blank")
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5",
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-card p-0 md:max-w-4xl overflow-hidden rounded-2xl border border-border shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={cn(categoryColors.bg, categoryColors.text)}>
              {place.category}
            </Badge>
            <Badge variant="outline">{place.governorate}</Badge>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-10rem)] md:max-h-[calc(90vh-6rem)]">
          <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
            {/* Map Section */}
            <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary/30 border border-border/50 relative">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                    place.title + ", " + place.address,
                  )}&zoom=15`}
                />
              </div>

              {/* Nearby Places */}
              {nearbyPlaces.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">{t('placeDetails.nearby', { governorate: place.governorate })}</h4>
                  <div className="space-y-2">
                    {nearbyPlaces.slice(0, 3).map((nearby) => {
                      const nearbyColors = CATEGORY_COLORS[nearby.category] || DEFAULT_CATEGORY_COLOR
                      return (
                        <div
                          key={nearby.placeId || nearby.position}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("h-2 w-2 rounded-full", nearbyColors.text.replace("text-", "bg-"))} />
                            <div>
                              <p className="text-sm font-medium text-foreground line-clamp-1">{nearby.title}</p>
                              <p className="text-xs text-muted-foreground">{nearby.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {nearby.rating}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <DialogTitle className="text-2xl font-semibold text-foreground mb-2">{place.title}</DialogTitle>
                <div className="flex items-center gap-3">
                  {renderStars(place.rating || 0)}
                  <span className="text-lg font-medium text-foreground">{place.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-muted-foreground">({t('placeDetails.reviewsCount', { count: (place.reviews || 0).toLocaleString() })})</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{place.address}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                {place.phoneNumber && (
                  <a
                    href={`tel:${place.phoneNumber}`}
                    className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('placeDetails.phone')}</p>
                      <p className="text-sm text-foreground">{place.phoneNumber}</p>
                    </div>
                  </a>
                )}
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <Globe className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('placeDetails.website')}</p>
                      <p className="text-sm text-foreground truncate">{t('placeDetails.visitSite')}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </a>
                )}
              </div>

              {/* Opening Hours */}
              {place.openingHours && place.openingHours.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    {t('placeDetails.openingHours')}
                  </div>
                  <div className="space-y-1 pl-6">
                    {place.openingHours.map((hours, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {hours}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              {place.priceRange && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('placeDetails.priceRange')}</span>
                  <span className="text-sm text-muted-foreground">{place.priceRange}</span>
                </div>
              )}

              {/* IDs */}
              {(place.placeId || place.cid) && (
                <div className="pt-4 border-t border-border/50">
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {place.placeId && <span>{t('placeDetails.placeId')} {place.placeId}</span>}
                    {place.cid && <span>{t('placeDetails.cid')} {place.cid}</span>}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4">
                <Button onClick={openInGoogleMaps} className="w-full gap-2">
                  <Navigation className="h-4 w-4" />
                  {t('placeDetails.openInMaps')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
