"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAdmin } from "@/lib/admin-context"
import { Place } from "@/lib/types"
import { CATEGORIES, TUNISIAN_GOVERNORATES } from "@/lib/constants"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface PlaceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  place?: Place | null
  mode: "add" | "edit"
}

export function PlaceFormModal({ open, onOpenChange, place, mode }: PlaceFormModalProps) {
  const { createPlace, updatePlace } = useAdmin()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    category: "",
    governorate: "",
    latitude: "",
    longitude: "",
    rating: "0",
    reviews: "0",
    phoneNumber: "",
    website: "",
    thumbnailUrl: "",
    priceRange: "",
  })

  // Load place data when editing
  useEffect(() => {
    if (mode === "edit" && place) {
      setFormData({
        title: place.title || "",
        address: place.address || "",
        category: place.category || "",
        governorate: place.governorate || "",
        latitude: place.latitude?.toString() || "",
        longitude: place.longitude?.toString() || "",
        rating: place.rating?.toString() || "0",
        reviews: place.reviews?.toString() || "0",
        phoneNumber: place.phoneNumber || "",
        website: place.website || "",
        thumbnailUrl: place.thumbnailUrl || "",
        priceRange: place.priceRange || "",
      })
    } else if (mode === "add") {
      // Reset form for add mode
      setFormData({
        title: "",
        address: "",
        category: "",
        governorate: "",
        latitude: "",
        longitude: "",
        rating: "0",
        reviews: "0",
        phoneNumber: "",
        website: "",
        thumbnailUrl: "",
        priceRange: "",
      })
    }
  }, [mode, place, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.address || !formData.category || !formData.governorate) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        setLoading(false)
        return
      }

      if (!formData.latitude || !formData.longitude) {
        toast.error("Les coordonnées GPS sont obligatoires")
        setLoading(false)
        return
      }

      const placeData = {
        title: formData.title,
        address: formData.address,
        category: formData.category,
        governorate: formData.governorate,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        phoneNumber: formData.phoneNumber || undefined,
        website: formData.website || undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        priceRange: formData.priceRange || undefined,
        position: 0,
      }

      if (mode === "edit" && place) {
        await updatePlace(place.id!, placeData)
        toast.success("Endroit mis à jour avec succès!")
      } else {
        await createPlace(placeData)
        toast.success("Endroit créé avec succès!")
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving place:", error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Modifier l'endroit" : "Ajouter un nouvel endroit"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifiez les informations de l'endroit"
              : "Remplissez les informations pour créer un nouvel endroit"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Café Prestige"
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                Adresse <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Tunis, Tunisie"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Catégorie <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Governorate */}
            <div className="space-y-2">
              <Label htmlFor="governorate">
                Gouvernorat <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.governorate}
                onValueChange={(value) => setFormData({ ...formData, governorate: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un gouvernorat" />
                </SelectTrigger>
                <SelectContent>
                  {TUNISIAN_GOVERNORATES.map((gov: string) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Latitude */}
            <div className="space-y-2">
              <Label htmlFor="latitude">
                Latitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="36.8065"
                required
              />
            </div>

            {/* Longitude */}
            <div className="space-y-2">
              <Label htmlFor="longitude">
                Longitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="10.1815"
                required
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Note (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                placeholder="4.5"
              />
            </div>

            {/* Reviews */}
            <div className="space-y-2">
              <Label htmlFor="reviews">Nombre d'avis</Label>
              <Input
                id="reviews"
                type="number"
                min="0"
                value={formData.reviews}
                onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                placeholder="100"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+216 XX XXX XXX"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="thumbnailUrl">URL de l'image</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="priceRange">Gamme de prix</Label>
              <Input
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                placeholder="€€"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
