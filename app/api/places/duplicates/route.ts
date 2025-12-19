import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/places/duplicates - Returns list of duplicate groups by CID
export async function GET() {
  try {
    // Fetch all places with non-null CID, sorted by creation date
    const allPlaces = await prisma.place.findMany({
      where: { cid: { not: null } },
      select: { id: true, cid: true, title: true, createdAt: true, placeId: true },
      orderBy: { createdAt: 'asc' }
    })

    // Group places by CID in-memory (MongoDB-optimized approach)
    const cidMap = new Map<string, typeof allPlaces>()
    allPlaces.forEach(place => {
      if (!cidMap.has(place.cid!)) {
        cidMap.set(place.cid!, [])
      }
      cidMap.get(place.cid!)!.push(place)
    })

    // Filter only duplicates (count > 1)
    const duplicateGroups = Array.from(cidMap.entries())
      .filter(([_, places]) => places.length > 1)
      .map(([cid, places]) => ({
        cid,
        count: places.length,
        keepId: places[0].id, // Oldest (first in sorted array)
        removeIds: places.slice(1).map(p => p.id),
        places: places.map(p => ({
          id: p.id,
          placeId: p.placeId,
          title: p.title,
          createdAt: p.createdAt
        }))
      }))

    return NextResponse.json({
      totalDuplicateGroups: duplicateGroups.length,
      totalPlacesToRemove: duplicateGroups.reduce((sum, g) => sum + g.removeIds.length, 0),
      groups: duplicateGroups
    })
  } catch (error) {
    console.error('Error fetching duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch duplicates', code: 'DUPLICATE_FETCH_FAILED' },
      { status: 500 }
    )
  }
}

// DELETE /api/places/duplicates - Removes duplicate places
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { idsToDelete } = body

    // Validate input
    if (!idsToDelete || !Array.isArray(idsToDelete) || idsToDelete.length === 0) {
      return NextResponse.json(
        { error: 'idsToDelete must be a non-empty array' },
        { status: 400 }
      )
    }

    // Delete duplicates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const deleted = await tx.place.deleteMany({
        where: { id: { in: idsToDelete } }
      })
      return deleted.count
    })

    return NextResponse.json({
      success: true,
      deletedCount: result
    })
  } catch (error) {
    console.error('Error removing duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to remove duplicates', code: 'DUPLICATE_REMOVAL_FAILED' },
      { status: 500 }
    )
  }
}
