import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportDarHotels() {
  console.log('🔍 Searching for hotels with "dar" in name...\n')

  try {
    // Query hotels with "dar" in the title (case insensitive)
    const darHotels = await prisma.place.findMany({
      where: {
        category: 'Hotel',
        title: {
          contains: 'dar',
          mode: 'insensitive'
        }
      },
      orderBy: {
        rating: 'desc'
      }
    })

    console.log(`✅ Found ${darHotels.length} hotels with "dar" in the name\n`)

    if (darHotels.length === 0) {
      console.log('No hotels found matching the criteria.')
      return
    }

    // Save to JSON file
    const outputPath = path.join(process.cwd(), 'dar-hotels.json')
    fs.writeFileSync(outputPath, JSON.stringify(darHotels, null, 2), 'utf-8')
    
    console.log(`💾 Saved to: ${outputPath}\n`)
    
    // Display summary
    console.log('📊 Summary:')
    console.log('='.repeat(60))
    darHotels.slice(0, 10).forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.title}`)
      console.log(`   📍 ${hotel.governorate} - ${hotel.address}`)
      console.log(`   ⭐ Rating: ${hotel.rating} (${hotel.reviews} reviews)`)
      if (hotel.phoneNumber) console.log(`   📞 ${hotel.phoneNumber}`)
      if (hotel.website) console.log(`   🌐 ${hotel.website}`)
      console.log('')
    })
    
    if (darHotels.length > 10) {
      console.log(`... and ${darHotels.length - 10} more hotels`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the export
exportDarHotels()
  .then(() => {
    console.log('\n✨ Export completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Export failed:', error)
    process.exit(1)
  })
