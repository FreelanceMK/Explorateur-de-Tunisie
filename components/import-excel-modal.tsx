"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileUp, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImportExcelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFileSelect: (file: File) => void
  onImport: () => Promise<void>
  selectedFile: File | null
  isLoading: boolean
}

export function ImportExcelModal({
  open,
  onOpenChange,
  onFileSelect,
  onImport,
  selectedFile,
  isLoading,
}: ImportExcelModalProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleImportClick = async () => {
    await onImport()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Places from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) to add, update, or delete places in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>File Format:</strong> Export your current data first to get the correct format. The Excel
              file should contain columns: id, placeId, cid, title, category, governorate, address, latitude,
              longitude, rating, reviews, phoneNumber, website, thumbnailUrl, priceRange, position.
              <br />
              <br />
              <strong>Operations:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>
                  <strong>Add:</strong> Rows without an id or placeId will be created as new places
                </li>
                <li>
                  <strong>Update:</strong> Rows with an existing placeId will update that place
                </li>
                <li>
                  <strong>Delete:</strong> Add a column "_operation" with value "DELETE" to remove places
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Excel File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isLoading}
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{selectedFile.name}</span> (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <Alert variant="destructive" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> This operation will modify your database. Make sure to backup your data
              before importing. Invalid rows will be skipped and reported after the import completes.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImportClick} disabled={!selectedFile || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Import Places
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
