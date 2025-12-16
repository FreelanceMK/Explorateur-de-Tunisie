"use client"

import { Download, Filter, MapPin, LayoutGrid, List, LogOut, Smartphone, Shield, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { IOSInstallModal } from "@/components/ios-install-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { clearSession } from "@/lib/auth"
import { t } from "@/lib/translations"
import { toast } from "sonner"
import { useAdmin } from "@/lib/admin-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

interface DashboardHeaderProps {
  totalCount: number
  filteredCount: number
  activeFilterCount: number
  onExport: (format: "excel" | "json") => void
  onOpenMobileFilter: () => void
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
  showExportButton: boolean
  onToggleStats?: () => void
  showStats?: boolean
}

export function DashboardHeader({
  totalCount,
  filteredCount,
  activeFilterCount,
  onExport,
  onOpenMobileFilter,
  viewMode,
  onViewModeChange,
  showExportButton,
  onToggleStats,
  showStats = false,
}: DashboardHeaderProps) {
  const router = useRouter()
  const { isAdminMode, activateAdminMode, deactivateAdminMode } = useAdmin()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const checkIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsIOS(checkIOS)

    console.log("Mobile check:", checkMobile, "iOS check:", checkIOS)

    // Only show install button on mobile devices
    if (!checkMobile) {
      console.log("Not mobile, exiting")
      return
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("Already installed")
      return
    }

    console.log("Setting showInstall to true")
    setShowInstall(true)

    // Android - listen for install prompt
    if (!checkIOS) {
      const handler = (e: Event) => {
        console.log("Install prompt received")
        e.preventDefault()
        setDeferredPrompt(e)
        setShowInstall(true)
      }

      window.addEventListener("beforeinstallprompt", handler)
      return () => window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    console.log("Install button clicked! isIOS:", isIOS, "deferredPrompt:", deferredPrompt)
    
    // iOS - show instructions modal
    if (isIOS) {
      console.log("Opening iOS modal")
      setShowIOSModal(true)
      return
    }

    // Android - trigger install prompt
    if (!deferredPrompt) {
      console.log("No deferred prompt available")
      return
    }
    console.log("Prompting install...")
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log("Install outcome:", outcome)
    if (outcome === "accepted") {
      setShowInstall(false)
    }
    setDeferredPrompt(null)
  }

  const handleLogout = () => {
    clearSession()
    deactivateAdminMode()
    toast.success("Déconnexion réussie")
    router.push("/login")
  }

  const handleTitleClick = () => {
    // Increment click count
    const newCount = clickCount + 1
    setClickCount(newCount)

    // Clear existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }

    // Reset click count after 2 seconds
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0)
    }, 2000)

    // Show admin dialog after 5 clicks
    if (newCount === 5) {
      setShowAdminDialog(true)
      setClickCount(0)
    }
  }

  const handleAdminUnlock = () => {
    const correctPassword = "Azerty123*"
    if (adminPassword === correctPassword) {
      activateAdminMode()
      toast.success("Mode admin activé!")
      setShowAdminDialog(false)
      setAdminPassword("")
    } else {
      toast.error("Code incorrect")
      setAdminPassword("")
    }
  }

  const handleAdminToggle = () => {
    if (isAdminMode) {
      deactivateAdminMode()
      toast.info("Mode admin désactivé")
    } else {
      setShowAdminDialog(true)
    }
  }

  return (
    <>
      <IOSInstallModal open={showIOSModal} onOpenChange={setShowIOSModal} />
      
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🔐 Accès Administrateur</AlertDialogTitle>
            <AlertDialogDescription>
              Entrez le code administrateur pour activer les fonctionnalités d'administration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Code administrateur"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdminUnlock()
                }
              }}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowAdminDialog(false)
              setAdminPassword("")
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAdminUnlock}>
              Déverrouiller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-2 px-4 md:px-6">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 
              className="text-base md:text-lg font-semibold text-foreground truncate cursor-pointer select-none hover:text-primary transition-colors"
              onClick={handleTitleClick}
              title={isAdminMode ? "Mode Admin Actif" : ""}
            >
              {t('header.title')}
              {isAdminMode && <span className="ml-2 text-xs text-primary">⚡</span>}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {filteredCount === totalCount
                ? t('header.placesCount', { count: totalCount })
                : t('header.placesFiltered', { filtered: filteredCount, total: totalCount })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleStats && (
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2 bg-transparent", showStats && "bg-primary/10 text-primary")}
              onClick={onToggleStats}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </Button>
          )}
          {isAdminMode && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
              onClick={handleAdminToggle}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          <div className="hidden sm:flex items-center border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", viewMode === "table" && "bg-secondary")}
              onClick={() => onViewModeChange("table")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">{t('header.tableView')}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", viewMode === "grid" && "bg-secondary")}
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">{t('header.gridView')}</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="relative md:hidden bg-transparent"
            onClick={onOpenMobileFilter}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge variant="default" className="absolute -right-1 -top-1 h-4 w-4 p-0 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {showExportButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport("excel")}>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("json")}>Export as JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('header.logout')}</span>
          </Button>

          {showInstall && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950"
              onClick={handleInstall}
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Install</span>
            </Button>
          )}

          <ThemeToggle />
        </div>
      </div>
      </header>
    </>
  )
}
