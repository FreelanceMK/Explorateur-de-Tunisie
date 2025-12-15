import { PlacesDashboard } from "@/components/places-dashboard"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute } from "@/components/protected-route"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export default function Home() {
  return (
    <ProtectedRoute>
      <PlacesDashboard />
      <PWAInstallPrompt />
      <Toaster position="bottom-right" />
    </ProtectedRoute>
  )
}
