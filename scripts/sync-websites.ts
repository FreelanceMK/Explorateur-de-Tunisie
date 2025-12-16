import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface DataJsonPlace {
  cid?: string
  placeId?: string
  website?: string
  title?: string
}

async function syncWebsites() {
  console.log('🔄 Starting website sync from data.json...\n')

  try {
    // Read data.json
    const dataPath = path.join(process.cwd(), 'public', 'data.json')
    console.log(`📖 Reading ${dataPath}...`)
    
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const allPlaces: DataJsonPlace[] = JSON.parse(rawData)
    console.log(`✅ Loaded ${allPlaces.length.toLocaleString()} places from data.json\n`)

    // Filter places that have websites
    const placesWithWebsites = allPlaces.filter(place => place.website && place.website.trim() !== '')
    console.log(`🌐 Found ${placesWithWebsites.length.toLocaleString()} places with websites in data.json\n`)

    // Get current count of places with websites in database
    const currentWebsiteCount = await prisma.place.count({
      where: {
        website: { not: { equals: null } }
      }
    })
    console.log(`📊 Current database has ${currentWebsiteCount} places with websites\n`)

    // Update websites in batches
    const BATCH_SIZE = 100
    let updated = 0
    let skipped = 0
    let notFound = 0
    let errors: any[] = []

    console.log('🔄 Starting batch updates...\n')

    for (let i = 0; i < placesWithWebsites.length; i += BATCH_SIZE) {
      const batch = placesWithWebsites.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(placesWithWebsites.length / BATCH_SIZE)
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} places)...`)

      for (const place of batch) {
        try {
          // Find place by cid or placeId
          const dbPlace = await prisma.place.findFirst({
            where: {
              OR: [
                place.cid ? { cid: place.cid } : {},
                place.placeId ? { placeId: place.placeId } : {},
              ]
            }
          })

          if (!dbPlace) {
            notFound++
            continue
          }

          // Skip if website already exists and is the same
          if (dbPlace.website === place.website) {
            skipped++
            continue
          }

          // Update website
          await prisma.place.update({
            where: { id: dbPlace.id },
            data: { website: place.website }
          })

          updated++
        } catch (error) {
          errors.push({
            place: place.title || place.cid || place.placeId,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }

      // Progress update every batch
      const progress = Math.min(i + BATCH_SIZE, placesWithWebsites.length)
      console.log(`  ✓ Progress: ${progress}/${placesWithWebsites.length} | Updated: ${updated} | Skipped: ${skipped} | Not found: ${notFound}`)
    }

    // Final summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ SYNC COMPLETE')
    console.log('='.repeat(60))
    console.log(`📊 Total places with websites in source: ${placesWithWebsites.length}`)
    console.log(`✅ Successfully updated: ${updated}`)
    console.log(`⏭️  Skipped (already correct): ${skipped}`)
    console.log(`❌ Not found in database: ${notFound}`)
    console.log(`⚠️  Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.slice(0, 10).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.place}: ${err.error}`)
      })
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`)
      }
    }

    // Check final count
    const finalWebsiteCount = await prisma.place.count({
      where: {
        website: { not: { equals: null } }
      }
    })
    console.log(`\n📊 Final database count: ${finalWebsiteCount} places with websites`)
    console.log(`📈 Net increase: +${finalWebsiteCount - currentWebsiteCount}`)

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncWebsites()
  .then(() => {
    console.log('\n✨ Website sync completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  })
