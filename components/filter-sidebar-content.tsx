"use client"

import { Search, X, Phone, Globe, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TUNISIAN_GOVERNORATES, CATEGORIES, CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/constants"
import type { FilterState, Place } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { t } from "@/lib/translations"

interface FilterSidebarContentProps {
  filters: FilterState
  allPlaces: Place[]
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  activeFilterCount: number
}

export function FilterSidebarContent({
  filters,
  allPlaces,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: FilterSidebarContentProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true)
  const [isGovernoratesOpen, setIsGovernoratesOpen] = useState(false)
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search)
  
  // Handle collapsible state changes - close others when one opens
  const handleCategoriesToggle = (open: boolean) => {
    setIsCategoriesOpen(open)
    if (open) {
      setIsGovernoratesOpen(false)
      setIsRatingOpen(false)
      setIsOptionsOpen(false)
    }
  }
  
  const handleGovernoratesToggle = (open: boolean) => {
    setIsGovernoratesOpen(open)
    if (open) {
      setIsCategoriesOpen(false)
      setIsRatingOpen(false)
      setIsOptionsOpen(false)
    }
  }
  
  const handleRatingToggle = (open: boolean) => {
    setIsRatingOpen(open)
    if (open) {
      setIsCategoriesOpen(false)
      setIsGovernoratesOpen(false)
      setIsOptionsOpen(false)
    }
  }
  
  const handleOptionsToggle = (open: boolean) => {
    setIsOptionsOpen(open)
    if (open) {
      setIsCategoriesOpen(false)
      setIsGovernoratesOpen(false)
      setIsRatingOpen(false)
    }
  }
  
  // Calculate category counts from all places
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allPlaces.forEach(place => {
      counts[place.category] = (counts[place.category] || 0) + 1
    })
    return counts
  }, [allPlaces])
  
  // Calculate governorate counts from all places
  const governorateCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allPlaces.forEach(place => {
      counts[place.governorate] = (counts[place.governorate] || 0) + 1
    })
    return counts
  }, [allPlaces])
  
  // Calculate option counts (phone and website)
  const optionCounts = useMemo(() => {
    const withPhone = allPlaces.filter(place => place.phoneNumber).length
    const withWebsite = allPlaces.filter(place => place.website).length
    return { phone: withPhone, website: withWebsite }
  }, [allPlaces])

  // Debounce search to improve performance
  const debouncedSearch = useDebounce((value: string) => {
    onFiltersChange({ ...filters, search: value })
  }, 300)

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const toggleGovernorate = (governorate: string) => {
    const newGovernorates = filters.governorates.includes(governorate)
      ? filters.governorates.filter((g) => g !== governorate)
      : [...filters.governorates, governorate]
    onFiltersChange({ ...filters, governorates: newGovernorates })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={onClearFilters} className="w-full bg-transparent">
          {t('filters.clearAll')} ({activeFilterCount})
        </Button>
      )}

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t('filters.search')}</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('filters.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
              debouncedSearch(e.target.value)
            }}
            className="pl-9 bg-secondary/50 border-border/50"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue("")
                onFiltersChange({ ...filters, search: "" })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <Collapsible open={isCategoriesOpen} onOpenChange={handleCategoriesToggle}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-medium text-foreground">{t('filters.categories')}</span>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", isCategoriesOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-2">
          {CATEGORIES.map((category) => {
            const colors = CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR
            const isSelected = filters.categories.includes(category)
            const count = categoryCounts[category] || 0
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                  isSelected
                    ? `${colors.bg} ${colors.text}`
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isSelected ? colors.text.replace("text-", "bg-") : "bg-muted-foreground/50",
                    )}
                  />
                  <span>{category}</span>
                </div>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs font-mono">
                  {count.toLocaleString()}
                </Badge>
              </button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Governorates */}
      <Collapsible open={isGovernoratesOpen} onOpenChange={handleGovernoratesToggle}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-medium text-foreground">Governorates</span>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", isGovernoratesOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-2 max-h-48 overflow-y-auto">
          {TUNISIAN_GOVERNORATES.map((governorate) => {
            const isSelected = filters.governorates.includes(governorate)
            const count = governorateCounts[governorate] || 0
            return (
              <button
                key={governorate}
                onClick={() => toggleGovernorate(governorate)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", isSelected ? "bg-primary" : "bg-muted-foreground/50")} />
                  <span>{governorate}</span>
                </div>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs font-mono">
                  {count.toLocaleString()}
                </Badge>
              </button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible open={isRatingOpen} onOpenChange={handleRatingToggle}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-medium text-foreground">Rating</span>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", isRatingOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="px-2">
            <Slider
              value={[filters.ratingMin, filters.ratingMax]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={([min, max]) => onFiltersChange({ ...filters, ratingMin: min, ratingMax: max })}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{filters.ratingMin} stars</span>
              <span>{filters.ratingMax} stars</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Options */}
      <Collapsible open={isOptionsOpen} onOpenChange={handleOptionsToggle}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <span className="text-sm font-medium text-foreground">Options</span>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", isOptionsOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={filters.hasPhone}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, hasPhone: checked as boolean })}
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Has phone number
              </div>
            </div>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-mono">
              {optionCounts.phone.toLocaleString()}
            </Badge>
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={filters.hasWebsite}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, hasWebsite: checked as boolean })}
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Has website
              </div>
            </div>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-mono">
              {optionCounts.website.toLocaleString()}
            </Badge>
          </label>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
