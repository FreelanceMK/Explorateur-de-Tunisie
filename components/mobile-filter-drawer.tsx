"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterSidebarContent } from "./filter-sidebar-content"
import type { FilterState, Place } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  allPlaces: Place[]
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  activeFilterCount: number
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  allPlaces,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: MobileFilterDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-65px)]">
          <FilterSidebarContent
            filters={filters}
            allPlaces={allPlaces}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </div>
    </>
  )
}
