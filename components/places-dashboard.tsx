"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { FilterSidebar } from "./filter-sidebar"
import { PlacesTable } from "./places-table"
import { PlacesGrid } from "./places-grid"
import { PlaceDetailsModal } from "./place-details-modal"
import { PlaceFormModal } from "./place-form-modal"
import { DashboardHeader } from "./dashboard-header"
import { MobileFilterDrawer } from "./mobile-filter-drawer"
import { StatisticsPanel } from "./statistics-panel"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAdmin } from "@/lib/admin-context"
import type { Place, FilterState, SortState } from "@/lib/types"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { RemoveDuplicatesModal } from "./remove-duplicates-modal"
import { ImportExcelModal } from "./import-excel-modal"

const initialFilters: FilterState = {
  search: "",
  categories: [],
  governorates: [],
  ratingMin: 0,
  ratingMax: 5,
  reviewsMin: 0,
  reviewsMax: 10000,
  hasPhone: false,
  hasWebsite: false,
}

const initialSort: SortState = {
  field: "rating",
  direction: "desc",
}

export function PlacesDashboard() {
  const isMobileOrTablet = typeof window !== "undefined" && window.innerWidth < 1024
  const { isAdminMode, isAddModalOpen, setIsAddModalOpen, isEditModalOpen, setIsEditModalOpen, editingPlace } = useAdmin()
  const [places, setPlaces] = useState<Place[]>([])
  const [allPlacesForFilters, setAllPlacesForFilters] = useState<Place[]>([])
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sort, setSort] = useState<SortState>(initialSort)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid">(isMobileOrTablet ? "grid" : "table")
  const [showExportButton, setShowExportButton] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPlaces, setTotalPlaces] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [filterStats, setFilterStats] = useState<{
    categories: Record<string, number>
    governorates: Record<string, number>
    withPhone: number
    withWebsite: number
  } | null>(null)

  // State for Remove Duplicates feature
  const [isRemoveDuplicatesOpen, setIsRemoveDuplicatesOpen] = useState(false)
  const [duplicatesInfo, setDuplicatesInfo] = useState<{
    totalDuplicateGroups: number
    totalPlacesToRemove: number
    groups: Array<{
      cid: string
      count: number
      keepId: string
      removeIds: string[]
    }>
  } | null>(null)
  const [isRemovingDuplicates, setIsRemovingDuplicates] = useState(false)

  // State for Excel Import feature
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Fetch places from API with filters and pagination
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Add pagination params
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      
      // Add sort params
      params.append('sortBy', sort.field)
      params.append('sortOrder', sort.direction)
      
      // Add filter params
      if (filters.search) params.append('search', filters.search)
      if (filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append('category', cat))
      }
      if (filters.governorates.length > 0) {
        filters.governorates.forEach(gov => params.append('governorate', gov))
      }
      if (filters.ratingMin > 0) params.append('ratingMin', filters.ratingMin.toString())
      if (filters.ratingMax < 5) params.append('ratingMax', filters.ratingMax.toString())
      if (filters.reviewsMin > 0) params.append('reviewsMin', filters.reviewsMin.toString())
      if (filters.reviewsMax < 10000) params.append('reviewsMax', filters.reviewsMax.toString())
      if (filters.hasPhone) params.append('hasPhone', 'true')
      if (filters.hasWebsite) params.append('hasWebsite', 'true')

      const response = await fetch(`/api/places?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch places')
      
      const data = await response.json()
      setPlaces(data.places || [])
      setTotalItems(data.total || 0)
      setTotalPlaces(data.totalAll || data.total || 0)
    } catch (error) {
      console.error('Error fetching places:', error)
      setPlaces([])
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, sort, filters])

  // Fetch all places for filter sidebar (categories and governorates)
  const fetchAllPlacesForFilters = useCallback(async () => {
    try {
      const response = await fetch('/api/places/stats')
      if (!response.ok) throw new Error('Failed to fetch stats for filters')
      
      const data = await response.json()
      
      // Convert arrays to maps for quick lookup
      const categoriesMap: Record<string, number> = {}
      data.categories?.forEach((cat: any) => {
        categoriesMap[cat.name] = cat.count
      })
      
      const governoratesMap: Record<string, number> = {}
      data.governorates?.forEach((gov: any) => {
        governoratesMap[gov.name] = gov.count
      })
      
      setFilterStats({
        categories: categoriesMap,
        governorates: governoratesMap,
        withPhone: data.contactInfo?.withPhone || 0,
        withWebsite: data.contactInfo?.withWebsite || 0,
      })
      setTotalPlaces(data.total || 0)
      setAllPlacesForFilters([]) // No longer needed since we use filterStats
    } catch (error) {
      console.error('Error fetching stats for filters:', error)
      setFilterStats(null)
      setAllPlacesForFilters([])
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  // Fetch all places once for filter sidebar
  useEffect(() => {
    fetchAllPlacesForFilters()
  }, [fetchAllPlacesForFilters])

  // Listen for refresh events from admin context
  useEffect(() => {
    const handleRefresh = () => {
      fetchPlaces()
      fetchAllPlacesForFilters()
    }
    
    window.addEventListener('refreshPlaces', handleRefresh)
    return () => window.removeEventListener('refreshPlaces', handleRefresh)
  }, [fetchPlaces, fetchAllPlacesForFilters])

  useEffect(() => {
    if (viewMode === "grid") {
      setItemsPerPage(24)
    } else {
      setItemsPerPage(30)
    }
    setCurrentPage(1)
  }, [viewMode])

  // Remove client-side filtering and sorting - now handled by API
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlace(place)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedPlace(null)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters)
    setCurrentPage(1)
  }, [])

  const handleFilterTitleClick = useCallback(() => {
    setShowExportButton(prev => !prev)
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.categories.length > 0) count++
    if (filters.governorates.length > 0) count++
    if (filters.ratingMin > 0 || filters.ratingMax < 5) count++
    if (filters.reviewsMin > 0 || filters.reviewsMax < 10000) count++
    if (filters.hasPhone) count++
    if (filters.hasWebsite) count++
    return count
  }, [filters])

  const handleExport = useCallback(
    async (format: "excel" | "json") => {
      try {
        // Fetch ALL places with current filters but no pagination
        const params = new URLSearchParams()

        // Add sort params
        params.append('sortBy', sort.field)
        params.append('sortOrder', sort.direction)

        // Add filter params (same as fetchPlaces but without pagination)
        if (filters.search) params.append('search', filters.search)
        if (filters.categories.length > 0) {
          filters.categories.forEach(cat => params.append('category', cat))
        }
        if (filters.governorates.length > 0) {
          filters.governorates.forEach(gov => params.append('governorate', gov))
        }
        if (filters.ratingMin > 0) params.append('ratingMin', filters.ratingMin.toString())
        if (filters.ratingMax < 5) params.append('ratingMax', filters.ratingMax.toString())
        if (filters.reviewsMin > 0) params.append('reviewsMin', filters.reviewsMin.toString())
        if (filters.reviewsMax < 10000) params.append('reviewsMax', filters.reviewsMax.toString())
        if (filters.hasPhone) params.append('hasPhone', 'true')
        if (filters.hasWebsite) params.append('hasWebsite', 'true')

        // Don't add pagination params to get all results
        params.append('limit', '999999') // Large number to get all results

        const response = await fetch(`/api/places?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch all places for export')

        const data = await response.json()
        const dataToExport = data.places || []

        if (format === "json") {
          const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: "application/json",
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "tunisia-places.json"
          a.click()
          URL.revokeObjectURL(url)
        } else {
          // Prepare data for Excel with ALL fields for round-trip import
          const excelData = dataToExport.map((place: Place) => ({
            id: place.id || "",
            placeId: place.placeId || "",
            cid: place.cid || "",
            title: place.title,
            category: place.category,
            governorate: place.governorate,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            rating: place.rating,
            reviews: place.reviews,
            phoneNumber: place.phoneNumber || "",
            website: place.website || "",
            thumbnailUrl: place.thumbnailUrl || "",
            priceRange: place.priceRange || "",
            position: place.position || 0,
          }))

          // Create workbook and worksheet
          const worksheet = XLSX.utils.json_to_sheet(excelData)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, "Places")

          // Set column widths for better formatting
          const columnWidths = [
            { wch: 25 }, // id
            { wch: 25 }, // placeId
            { wch: 20 }, // cid
            { wch: 35 }, // title
            { wch: 20 }, // category
            { wch: 15 }, // governorate
            { wch: 45 }, // address
            { wch: 12 }, // latitude
            { wch: 12 }, // longitude
            { wch: 8 },  // rating
            { wch: 10 }, // reviews
            { wch: 18 }, // phoneNumber
            { wch: 35 }, // website
            { wch: 40 }, // thumbnailUrl
            { wch: 15 }, // priceRange
            { wch: 10 }, // position
          ]
          worksheet["!cols"] = columnWidths

          // Generate Excel file and trigger download
          XLSX.writeFile(workbook, "tunisia-places.xlsx")
        }
      } catch (error) {
        console.error('Error exporting data:', error)
        alert('Failed to export data. Please try again.')
      }
    },
    [sort, filters],
  )

  // Handler for Remove Duplicates
  const handleRemoveDuplicatesClick = useCallback(async () => {
    try {
      const response = await fetch('/api/places/duplicates')
      if (!response.ok) throw new Error('Failed to fetch duplicates')

      const data = await response.json()
      setDuplicatesInfo(data)
      setIsRemoveDuplicatesOpen(true)
    } catch (error) {
      console.error('Error fetching duplicates:', error)
      toast.error('Failed to fetch duplicates')
    }
  }, [])

  const handleRemoveDuplicatesConfirm = useCallback(async () => {
    if (!duplicatesInfo) return

    setIsRemovingDuplicates(true)
    try {
      // Collect all IDs to delete from all duplicate groups
      const idsToDelete = duplicatesInfo.groups.flatMap(group => group.removeIds)

      const response = await fetch('/api/places/duplicates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idsToDelete })
      })

      if (!response.ok) throw new Error('Failed to remove duplicates')

      const result = await response.json()
      toast.success(`Successfully removed ${result.deletedCount} duplicate places!`)

      // Refresh places list
      fetchPlaces()
      fetchAllPlacesForFilters()

      setIsRemoveDuplicatesOpen(false)
      setDuplicatesInfo(null)
    } catch (error) {
      console.error('Error removing duplicates:', error)
      toast.error('Failed to remove duplicates')
    } finally {
      setIsRemovingDuplicates(false)
    }
  }, [duplicatesInfo, fetchPlaces, fetchAllPlacesForFilters])

  // Handler for Excel Import
  const handleImportClick = useCallback(() => {
    setIsImportOpen(true)
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
  }, [])

  const handleImportConfirm = useCallback(async () => {
    if (!selectedFile) return

    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/places/import', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import Excel file')
      }

      const result = await response.json()

      // Show success message with stats
      toast.success(
        `Import completed! Created: ${result.stats.created}, Updated: ${result.stats.updated}, Deleted: ${result.stats.deleted}, Skipped: ${result.stats.skipped}`
      )

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        toast.warning(`${result.errors.length} rows had errors. Check console for details.`)
        console.error('Import errors:', result.errors)
      }

      // Refresh places list
      fetchPlaces()
      fetchAllPlacesForFilters()

      setIsImportOpen(false)
      setSelectedFile(null)
    } catch (error: any) {
      console.error('Error importing Excel:', error)
      toast.error(error.message || 'Failed to import Excel file')
    } finally {
      setIsImporting(false)
    }
  }, [selectedFile, fetchPlaces, fetchAllPlacesForFilters])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        totalCount={totalPlaces}
        filteredCount={totalItems}
        activeFilterCount={activeFilterCount}
        onExport={handleExport}
        onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showExportButton={showExportButton}
        onToggleStats={() => setShowStats(!showStats)}
        showStats={showStats}
        onRemoveDuplicates={handleRemoveDuplicatesClick}
        onImportExcel={handleImportClick}
      />

      {showStats ? (
        <StatisticsPanel />
      ) : (
        <div className="flex">
          <FilterSidebar
            filters={filters}
            allPlaces={allPlacesForFilters}
            filterStats={filterStats || undefined}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters)
              setCurrentPage(1)
            }}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
            onFilterTitleClick={handleFilterTitleClick}
          />

          <main className="flex-1 md:ml-72 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="p-6">
            {viewMode === "table" ? (
              <PlacesTable
                places={places}
                isLoading={isLoading}
                sort={sort}
                onSortChange={setSort}
                onPlaceClick={handlePlaceClick}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items)
                  setCurrentPage(1)
                }}
              />
            ) : (
              <PlacesGrid
                places={places}
                isLoading={isLoading}
                onPlaceClick={handlePlaceClick}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items)
                  setCurrentPage(1)
                }}
              />
            )}
            </div>
          </main>
        </div>
      )}

      <PlaceDetailsModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        nearbyPlaces={allPlacesForFilters
          .filter((p) => p.placeId !== selectedPlace?.placeId && p.governorate === selectedPlace?.governorate)
          .slice(0, 5)}
      />

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        allPlaces={allPlacesForFilters}
        filterStats={filterStats || undefined}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setCurrentPage(1)
        }}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      <PlaceFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        mode="add"
      />

      <PlaceFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        place={editingPlace}
        mode="edit"
      />

      <RemoveDuplicatesModal
        open={isRemoveDuplicatesOpen}
        onOpenChange={setIsRemoveDuplicatesOpen}
        duplicatesInfo={duplicatesInfo}
        onConfirm={handleRemoveDuplicatesConfirm}
        isLoading={isRemovingDuplicates}
      />

      <ImportExcelModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onFileSelect={handleFileSelect}
        onImport={handleImportConfirm}
        selectedFile={selectedFile}
        isLoading={isImporting}
      />

      {isAdminMode && (
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          size="icon"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
