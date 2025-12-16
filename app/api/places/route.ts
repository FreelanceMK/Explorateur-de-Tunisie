import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/places - Fetch places with filters, pagination, and sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Filters
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const governorate = searchParams.get('governorate')
    const minRating = searchParams.get('minRating')
    const maxRating = searchParams.get('maxRating')
    const minReviews = searchParams.get('minReviews')
    const maxReviews = searchParams.get('maxReviews')
    const hasPhone = searchParams.get('hasPhone')
    const hasWebsite = searchParams.get('hasWebsite')

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'rating'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Map frontend sort field to database field
    const sortFieldMap: Record<string, string> = {
      'title': 'title',
      'rating': 'rating',
      'reviews': 'reviews',
      'position': 'position'
    }
    
    const sortField = sortFieldMap[sortBy] || 'rating'
    const sortDirection = (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : 'desc'

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (governorate && governorate !== 'all') {
      where.governorate = governorate
    }

    if (minRating || maxRating) {
      where.rating = {}
      if (minRating) where.rating.gte = parseFloat(minRating)
      if (maxRating) where.rating.lte = parseFloat(maxRating)
    }

    if (minReviews || maxReviews) {
      where.reviews = {}
      if (minReviews) where.reviews.gte = parseInt(minReviews)
      if (maxReviews) where.reviews.lte = parseInt(maxReviews)
    }

    if (hasPhone === 'true') {
      where.phoneNumber = { not: { equals: null } }
    }

    if (hasWebsite === 'true') {
      where.website = { not: { equals: null } }
    }

    // Build orderBy
    const orderBy: any = {}
    orderBy[sortField] = sortDirection

    // Get total count of all places (without filters)
    const totalAll = await prisma.place.count()

    // Fetch data with filtered count
    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.place.count({ where }),
    ])

    return NextResponse.json({
      places,
      total,
      totalAll,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    )
  }
}

// POST /api/places - Create a new place
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { title, address, category, governorate, latitude, longitude, rating, reviews, position } = body

    if (!title || !address || !category || !governorate || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create place
    const place = await prisma.place.create({
      data: {
        title,
        address,
        category,
        governorate,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        rating: parseFloat(rating) || 0,
        reviews: parseInt(reviews) || 0,
        position: parseInt(position) || 0,
        phoneNumber: body.phoneNumber,
        website: body.website,
        cid: body.cid,
        placeId: body.placeId,
        openingHours: body.openingHours,
        priceRange: body.priceRange,
        gridLat: body.gridLat ? parseFloat(body.gridLat) : undefined,
        gridLng: body.gridLng ? parseFloat(body.gridLng) : undefined,
        type: body.type,
        types: body.types || [],
        ratingCount: body.ratingCount ? parseInt(body.ratingCount) : undefined,
        thumbnailUrl: body.thumbnailUrl,
        fid: body.fid,
      },
    })

    return NextResponse.json(place, { status: 201 })
  } catch (error) {
    console.error('Error creating place:', error)
    return NextResponse.json(
      { error: 'Failed to create place' },
      { status: 500 }
    )
  }
}
