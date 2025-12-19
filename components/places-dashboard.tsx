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
          // Prepare data for Excel
          const excelData = dataToExport.map((place: Place) => ({
            Title: place.title,
            Category: place.category,
            Governorate: place.governorate,
            Address: place.address,
            Rating: place.rating,
            Reviews: place.reviews,
            Phone: place.phoneNumber || "",
            Website: place.website || "",
          }))

          // Create workbook and worksheet
          const worksheet = XLSX.utils.json_to_sheet(excelData)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, "Places")

          // Set column widths for better formatting
          const columnWidths = [
            { wch: 30 }, // Title
            { wch: 20 }, // Category
            { wch: 15 }, // Governorate
            { wch: 40 }, // Address
            { wch: 8 },  // Rating
            { wch: 10 }, // Reviews
            { wch: 15 }, // Phone
            { wch: 30 }, // Website
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
      />

      {showStats ? (
        <StatisticsPanel />
      ) : (
        <div className="flex">
          <FilterSidebar
            filters={filters}
            allPlaces={allPlacesForFilters}
            filterStats={filterStats}
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
        filterStats={filterStats}
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
