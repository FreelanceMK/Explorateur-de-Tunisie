"use client"

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
import { Loader2 } from "lucide-react"

interface RemoveDuplicatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicatesInfo: {
    totalDuplicateGroups: number
    totalPlacesToRemove: number
    groups: Array<{
      cid: string
      count: number
      keepId: string
      removeIds: string[]
    }>
  } | null
  onConfirm: () => Promise<void>
  isLoading: boolean
}

export function RemoveDuplicatesModal({
  open,
  onOpenChange,
  duplicatesInfo,
  onConfirm,
  isLoading,
}: RemoveDuplicatesModalProps) {
  if (!duplicatesInfo) return null

  const hasDuplicates = duplicatesInfo.totalPlacesToRemove > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasDuplicates ? "Remove Duplicate Places" : "No Duplicates Found"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasDuplicates ? (
              <>
                Found <strong>{duplicatesInfo.totalDuplicateGroups}</strong> groups of duplicates with{" "}
                <strong>{duplicatesInfo.totalPlacesToRemove}</strong> duplicate entries.
                <br />
                <br />
                The oldest entry (by creation date) in each group will be kept, and newer duplicates will be
                removed.
              </>
            ) : (
              "All places have unique CIDs. No duplicates were found in your database."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasDuplicates && duplicatesInfo.groups.length > 0 && (
          <div className="max-h-96 overflow-y-auto rounded-md border p-4">
            <h4 className="mb-3 text-sm font-semibold">Duplicate Groups Preview:</h4>
            <div className="space-y-3">
              {duplicatesInfo.groups.slice(0, 10).map((group, index) => (
                <div key={group.cid} className="rounded-md bg-muted/50 p-3 text-sm">
                  <div className="font-medium text-foreground">
                    Group {index + 1}: CID "{group.cid}"
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {group.count} duplicates → Will keep 1, remove {group.removeIds.length}
                  </div>
                </div>
              ))}
              {duplicatesInfo.groups.length > 10 && (
                <div className="text-center text-xs text-muted-foreground">
                  ... and {duplicatesInfo.groups.length - 10} more groups
                </div>
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          {hasDuplicates && (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                onConfirm()
              }}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove {duplicatesInfo.totalPlacesToRemove} Duplicates
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
