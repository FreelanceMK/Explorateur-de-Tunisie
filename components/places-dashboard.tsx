"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { FilterSidebar } from "./filter-sidebar"
import { PlacesTable } from "./places-table"
import { PlacesGrid } from "./places-grid"
import { PlaceDetailsModal } from "./place-details-modal"
import { DashboardHeader } from "./dashboard-header"
import { MobileFilterDrawer } from "./mobile-filter-drawer"
import { loadPlacesFromData, loadMorePlaces, getLoadStatus } from "@/lib/load-data"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Place, FilterState, SortState } from "@/lib/types"
import * as XLSX from "xlsx"

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
  const [places] = useState<Place[]>(loadPlacesFromData())
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

  useEffect(() => {
    if (viewMode === "grid") {
      setItemsPerPage(24)
    } else {
      setItemsPerPage(30)
    }
    setCurrentPage(1)
  }, [viewMode])

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          (place.title?.toLowerCase() || "").includes(searchLower) ||
          (place.address?.toLowerCase() || "").includes(searchLower) ||
          (place.category?.toLowerCase() || "").includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filters.categories.length > 0) {
        if (!filters.categories.includes(place.category)) return false
      }

      if (filters.governorates.length > 0) {
        if (!filters.governorates.includes(place.governorate)) return false
      }

      if (place.rating < filters.ratingMin || place.rating > filters.ratingMax) {
        return false
      }

      if (place.reviews < filters.reviewsMin || place.reviews > filters.reviewsMax) {
        return false
      }

      if (filters.hasPhone && !place.phoneNumber) return false
      if (filters.hasWebsite && !place.website) return false

      return true
    })
  }, [places, filters])

  const sortedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => {
      let comparison = 0
      switch (sort.field) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "rating":
          comparison = a.rating - b.rating
          break
        case "reviews":
          comparison = a.reviews - b.reviews
          break
      }
      return sort.direction === "asc" ? comparison : -comparison
    })
  }, [filteredPlaces, sort])

  const paginatedPlaces = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedPlaces.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedPlaces, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedPlaces.length / itemsPerPage)

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
    (format: "excel" | "json") => {
      const dataToExport = sortedPlaces

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
        const headers = ["Title", "Category", "Governorate", "Address", "Rating", "Reviews", "Phone", "Website"]
        const excelData = dataToExport.map((place) => ({
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
    },
    [sortedPlaces],
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        totalCount={places.length}
        filteredCount={sortedPlaces.length}
        activeFilterCount={activeFilterCount}
        onExport={handleExport}
        onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showExportButton={showExportButton}
      />

      <div className="flex">
        <FilterSidebar
          filters={filters}
          allPlaces={places}
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
              places={paginatedPlaces}
              isLoading={isLoading}
              sort={sort}
              onSortChange={setSort}
              onPlaceClick={handlePlaceClick}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sortedPlaces.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items)
                setCurrentPage(1)
              }}
            />
          ) : (
            <PlacesGrid
              places={paginatedPlaces}
              isLoading={isLoading}
              onPlaceClick={handlePlaceClick}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sortedPlaces.length}
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

      <PlaceDetailsModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        nearbyPlaces={places
          .filter((p) => p.placeId !== selectedPlace?.placeId && p.governorate === selectedPlace?.governorate)
          .slice(0, 5)}
      />

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        allPlaces={places}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setCurrentPage(1)
        }}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  )
}
