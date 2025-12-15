"use client"

import { Share, Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface IOSInstallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IOSInstallModal({ open, onOpenChange }: IOSInstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install on iOS</DialogTitle>
          <DialogDescription>
            Add Tunisia Places Explorer to your home screen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
              <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">1</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm">
                Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button in Safari
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
              <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">2</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm">
                Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> <strong>Add to Home Screen</strong>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
              <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">3</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm">
                Tap <strong>Add</strong> to complete the installation
              </p>
            </div>
          </div>
        </div>
        
        <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  )
}
