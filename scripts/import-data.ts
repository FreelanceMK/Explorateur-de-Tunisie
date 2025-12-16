import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface RawPlace {
  position: number
  title: string
  address: string
  latitude: number
  longitude: number
  rating: number
  ratingCount?: number
  type?: string
  types?: string[]
  phoneNumber?: string
  openingHours?: Record<string, string> | string[]
  thumbnailUrl?: string
  cid?: string
  fid?: string
  placeId?: string
  category?: string
  governorate?: string
  grid_lat?: number
  grid_lng?: number
  website?: string
  priceRange?: string
}

async function importData() {
  console.log('🚀 Starting data import...')

  // Read data.json file
  const dataPath = path.join(process.cwd(), 'data.json')
  console.log(`📁 Reading data from: ${dataPath}`)

  if (!fs.existsSync(dataPath)) {
    throw new Error(`data.json not found at ${dataPath}`)
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as RawPlace[]
  console.log(`📊 Found ${rawData.length} records in data.json`)

  // Check if data already exists
  const existingCount = await prisma.place.count()
  if (existingCount > 0) {
    console.log(`⚠️  Database already contains ${existingCount} places`)
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise<string>((resolve) => {
      readline.question('Do you want to clear existing data and reimport? (yes/no): ', resolve)
    })
    readline.close()

    if (answer.toLowerCase() === 'yes') {
      console.log('🗑️  Clearing existing data...')
      await prisma.place.deleteMany({})
      console.log('✅ Existing data cleared')
    } else {
      console.log('❌ Import cancelled')
      return
    }
  }

  // Process and import data in batches
  const BATCH_SIZE = 500
  let imported = 0
  let skipped = 0
  const errors: Array<{ index: number; error: string }> = []

  for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
    const batch = rawData.slice(i, i + BATCH_SIZE)
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rawData.length / BATCH_SIZE)} (records ${i + 1}-${Math.min(i + BATCH_SIZE, rawData.length)})`)

    const transformedBatch = batch
      .map((item, batchIndex) => {
        try {
          // Skip records with missing required fields
          if (!item.title || !item.address || item.latitude === undefined || item.longitude === undefined) {
            skipped++
            return null
          }

          // Transform opening hours to consistent JSON format
          let openingHours = item.openingHours
          if (Array.isArray(openingHours)) {
            openingHours = openingHours.reduce((acc, hour, idx) => {
              acc[`day${idx}`] = hour
              return acc
            }, {} as Record<string, string>)
          }

          return {
            title: item.title,
            address: item.address,
            category: item.category || item.type || 'Non spécifié',
            governorate: item.governorate || 'Non spécifié',
            latitude: item.latitude,
            longitude: item.longitude,
            rating: item.rating || 0,
            reviews: item.ratingCount || 0,
            position: item.position,
            phoneNumber: item.phoneNumber,
            website: item.website,
            cid: item.cid,
            placeId: item.placeId || `${item.cid || ''}`,
            openingHours: openingHours || undefined,
            priceRange: item.priceRange,
            gridLat: item.grid_lat,
            gridLng: item.grid_lng,
            type: item.type,
            types: item.types || [],
            ratingCount: item.ratingCount,
            thumbnailUrl: item.thumbnailUrl,
            fid: item.fid,
          }
        } catch (error) {
          errors.push({
            index: i + batchIndex,
            error: error instanceof Error ? error.message : String(error)
          })
          return null
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    try {
      // Insert records one by one to handle duplicates gracefully
      for (const place of transformedBatch) {
        try {
          await prisma.place.create({
            data: place,
          })
          imported++
        } catch (error: any) {
          // Skip duplicate entries (unique constraint violation)
          if (error.code === 'P2002') {
            skipped++
          } else {
            throw error
          }
        }
      }

      console.log(`✅ Processed ${transformedBatch.length} records from this batch`)
    } catch (error) {
      console.error(`❌ Error importing batch starting at index ${i}:`, error)
      errors.push({
        index: i,
        error: error instanceof Error ? error.message : String(error)
      })
    }

    // Progress indicator
    const progress = Math.round((Math.min(i + BATCH_SIZE, rawData.length) / rawData.length) * 100)
    console.log(`⏳ Progress: ${progress}%`)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Import Summary:')
  console.log('='.repeat(50))
  console.log(`✅ Successfully imported: ${imported} places`)
  console.log(`⏭️  Skipped (missing required fields): ${skipped}`)
  console.log(`❌ Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:')
    errors.slice(0, 10).forEach(({ index, error }) => {
      console.log(`  - Record ${index}: ${error}`)
    })
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`)
    }
  }

  // Verify final count
  const finalCount = await prisma.place.count()
  console.log(`\n🎉 Total places in database: ${finalCount}`)
}

// Run the import
importData()
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
