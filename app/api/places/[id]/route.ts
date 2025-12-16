import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/places/[id] - Get a single place by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const place = await prisma.place.findUnique({
      where: { id },
    })

    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(place)
  } catch (error) {
    console.error('Error fetching place:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place' },
      { status: 500 }
    )
  }
}

// PATCH /api/places/[id] - Update a place
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
    })

    if (!existingPlace) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    // Update place
    const updatedPlace = await prisma.place.update({
      where: { id },
      data: {
        title: body.title,
        address: body.address,
        category: body.category,
        governorate: body.governorate,
        latitude: body.latitude !== undefined ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude !== undefined ? parseFloat(body.longitude) : undefined,
        rating: body.rating !== undefined ? parseFloat(body.rating) : undefined,
        reviews: body.reviews !== undefined ? parseInt(body.reviews) : undefined,
        position: body.position !== undefined ? parseInt(body.position) : undefined,
        phoneNumber: body.phoneNumber,
        website: body.website,
        cid: body.cid,
        placeId: body.placeId,
        openingHours: body.openingHours,
        priceRange: body.priceRange,
        gridLat: body.gridLat !== undefined ? parseFloat(body.gridLat) : undefined,
        gridLng: body.gridLng !== undefined ? parseFloat(body.gridLng) : undefined,
        type: body.type,
        types: body.types,
        ratingCount: body.ratingCount !== undefined ? parseInt(body.ratingCount) : undefined,
        thumbnailUrl: body.thumbnailUrl,
        fid: body.fid,
      },
    })

    return NextResponse.json(updatedPlace)
  } catch (error) {
    console.error('Error updating place:', error)
    return NextResponse.json(
      { error: 'Failed to update place' },
      { status: 500 }
    )
  }
}

// DELETE /api/places/[id] - Delete a place
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
    })

    if (!existingPlace) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    // Delete place
    await prisma.place.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Place deleted successfully' })
  } catch (error) {
    console.error('Error deleting place:', error)
    return NextResponse.json(
      { error: 'Failed to delete place' },
      { status: 500 }
    )
  }
}
