"use client"

import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Phone,
  Globe,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPinOff,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants"
import type { Place, SortState, SortField } from "@/lib/types"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { useAdmin } from "@/lib/admin-context"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { toast } from "sonner"

interface PlacesTableProps {
  places: Place[]
  isLoading: boolean
  sort: SortState
  onSortChange: (sort: SortState) => void
  onPlaceClick: (place: Place) => void
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export function PlacesTable({
  places,
  isLoading,
  sort,
  onSortChange,
  onPlaceClick,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: PlacesTableProps) {
  const { isAdminMode, deletePlace, setEditingPlace, setIsEditModalOpen } = useAdmin()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null)

  const handleEdit = (e: React.MouseEvent, place: Place) => {
    e.stopPropagation()
    setEditingPlace(place)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, place: Place) => {
    e.stopPropagation()
    setPlaceToDelete(place)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!placeToDelete || !placeToDelete.id) return

    try {
      await deletePlace(placeToDelete.id)
      toast.success("Endroit supprimé avec succès!")
      setDeleteDialogOpen(false)
      setPlaceToDelete(null)
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }
  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      onSortChange({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      })
    } else {
      onSortChange({ field, direction: "desc" })
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3.5 w-3.5",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-muted-foreground/30",
            )}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{rating?.toFixed(1) || '0.0'}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[300px]">{t('table.title')}</TableHead>
                <TableHead>{t('table.category')}</TableHead>
                <TableHead>{t('table.governorate')}</TableHead>
                <TableHead>{t('table.rating')}</TableHead>
                <TableHead>{t('table.reviews')}</TableHead>
                <TableHead>{t('table.contact')}</TableHead>
                <TableHead className="w-[80px]">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <h3 className="text-lg font-semibold text-foreground">{t('table.noResults')}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {t('table.noResultsDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[300px]">
                <button
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  {t('table.title')}
                  <SortIcon field="title" />
                </button>
              </TableHead>
              <TableHead>{t('table.category')}</TableHead>
              <TableHead>{t('table.governorate')}</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("rating")}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  {t('table.rating')}
                  <SortIcon field="rating" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("reviews")}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  {t('table.reviews')}
                  <SortIcon field="reviews" />
                </button>
              </TableHead>
              <TableHead>{t('table.contact')}</TableHead>
              <TableHead className="w-[80px]">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {places.map((place, index) => {
              const categoryColors = CATEGORY_COLORS[place.category] || DEFAULT_CATEGORY_COLOR
              // Generate stable unique key for React
              const uniqueKey = place.placeId || place.cid || place.fid || `${index}-${place.title}`
              return (
                <TableRow
                  key={uniqueKey}
                  className="border-border/50 cursor-pointer transition-colors hover:bg-secondary/30"
                  onClick={() => onPlaceClick(place)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">{place.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{place.address}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("font-normal", categoryColors.bg, categoryColors.text)}>
                      {place.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {place.governorate}
                    </Badge>
                  </TableCell>
                  <TableCell>{renderStars(place.rating)}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{place.reviews.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {place.phoneNumber && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`tel:${place.phoneNumber}`)
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      {place.website && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(place.website, "_blank")
                          }}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPlaceClick(place)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdminMode && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                            onClick={(e) => handleEdit(e, place)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={(e) => handleDeleteClick(e, place)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{placeToDelete?.title}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <span>{t('table.showingResults', { count: itemsPerPage.toString(), total: totalItems.toString() })}</span>
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
