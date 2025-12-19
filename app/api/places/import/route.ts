import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { CATEGORIES, TUNISIAN_GOVERNORATES } from '@/lib/constants'

// Configure for large files
export const maxDuration = 60 // 60 seconds
export const dynamic = 'force-dynamic'

const REQUIRED_FIELDS = ['title', 'category', 'governorate', 'address', 'latitude', 'longitude']
const BATCH_SIZE = 100

interface ValidationResult {
  valid: boolean
  errors: string[]
}

function validateRow(row: any, rowNumber: number): ValidationResult {
  const errors: string[] = []

  // Validate required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!row[field] || (typeof row[field] === 'string' && !row[field].trim())) {
      errors.push(`${field} is required`)
    }
  })

  // Validate coordinates
  if (row.latitude !== undefined && row.latitude !== null) {
    const lat = parseFloat(row.latitude)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('latitude must be between -90 and 90')
    }
  }
  if (row.longitude !== undefined && row.longitude !== null) {
    const lng = parseFloat(row.longitude)
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('longitude must be between -180 and 180')
    }
  }

  // Validate category
  if (row.category && !CATEGORIES.includes(row.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`)
  }

  // Validate governorate
  if (row.governorate && !TUNISIAN_GOVERNORATES.includes(row.governorate)) {
    errors.push(`governorate must be one of: ${TUNISIAN_GOVERNORATES.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

// POST /api/places/import - Process Excel file upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .xlsx and .xls files are supported' },
        { status: 400 }
      )
    }

    // Parse Excel file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty' },
        { status: 400 }
      )
    }

    // Validate and prepare rows
    const parsedRows = await Promise.all(
      jsonData.map(async (row: any, index: number) => {
        const rowNumber = index + 2 // Excel row (1-indexed + header)
        const validation = validateRow(row, rowNumber)

        // Determine operation
        let operation = row._operation?.toUpperCase() || 'AUTO'

        if (operation === 'AUTO') {
          if (row.placeId) {
            // Check if place exists
            const existing = await prisma.place.findUnique({
              where: { placeId: row.placeId },
              select: { id: true }
            })
            operation = existing ? 'UPDATE' : 'ADD'
          } else {
            operation = 'ADD'
          }
        }

        // Prepare data object
        const data: any = {
          title: row.title?.trim(),
          category: row.category?.trim(),
          governorate: row.governorate?.trim(),
          address: row.address?.trim(),
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          rating: row.rating ? parseFloat(row.rating) : 0,
          reviews: row.reviews ? parseInt(row.reviews) : 0,
          position: row.position ? parseInt(row.position) : 0,
        }

        // Add optional fields
        if (row.placeId) data.placeId = row.placeId.trim()
        if (row.cid) data.cid = row.cid.trim()
        if (row.phoneNumber) data.phoneNumber = row.phoneNumber.trim()
        if (row.website) data.website = row.website.trim()
        if (row.thumbnailUrl) data.thumbnailUrl = row.thumbnailUrl.trim()
        if (row.priceRange) data.priceRange = row.priceRange.trim()

        return {
          rowNumber,
          operation,
          data,
          errors: validation.errors,
          isValid: validation.valid
        }
      })
    )

    // Separate valid and invalid rows
    const validRows = parsedRows.filter(r => r.isValid)
    const invalidRows = parsedRows.filter(r => !r.isValid)

    // Execute operations in batches
    let created = 0
    let updated = 0
    let deleted = 0
    let skipped = invalidRows.length
    const operationErrors: Array<{ row: number; error: string }> = invalidRows.map(r => ({
      row: r.rowNumber,
      error: r.errors.join(', ')
    }))

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE)

      await prisma.$transaction(async (tx) => {
        for (const row of batch) {
          try {
            if (row.operation === 'ADD') {
              await tx.place.create({ data: row.data })
              created++
            } else if (row.operation === 'UPDATE') {
              if (!row.data.placeId) {
                operationErrors.push({
                  row: row.rowNumber,
                  error: 'placeId is required for UPDATE operation'
                })
                skipped++
                continue
              }
              await tx.place.update({
                where: { placeId: row.data.placeId },
                data: row.data
              })
              updated++
            } else if (row.operation === 'DELETE') {
              if (!row.data.placeId) {
                operationErrors.push({
                  row: row.rowNumber,
                  error: 'placeId is required for DELETE operation'
                })
                skipped++
                continue
              }
              await tx.place.delete({
                where: { placeId: row.data.placeId }
              })
              deleted++
            }
          } catch (error: any) {
            operationErrors.push({
              row: row.rowNumber,
              error: error.message || 'Operation failed'
            })
            skipped++
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        created,
        updated,
        deleted,
        skipped
      },
      errors: operationErrors
    })
  } catch (error: any) {
    console.error('Error importing Excel:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import Excel file' },
      { status: 500 }
    )
  }
}
