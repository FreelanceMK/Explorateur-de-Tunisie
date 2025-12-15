"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IOSInstallModal } from "@/components/ios-install-modal"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if mobile device
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    const checkIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsMobile(checkMobile)
    setIsIOS(checkIOS)

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      return
    }

    // iOS devices - show prompt immediately for iOS modal
    if (checkIOS) {
      setShowPrompt(true)
      return
    }

    // Android - Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    // iOS - show instructions modal
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    // Android - trigger install prompt
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!showPrompt || !isMobile) return null

  return (
    <>
      <IOSInstallModal open={showIOSModal} onOpenChange={setShowIOSModal} />
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-500 md:left-auto md:right-4 md:w-96">
      <Card className="border-sky-500/50 bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">Install App</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Install Tunisia Places Explorer for quick access and offline use
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                Install
              </Button>
              <Button onClick={handleDismiss} size="sm" variant="outline" className="flex-1">
                Not now
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      </div>
    </>
  )
}
