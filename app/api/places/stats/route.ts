import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/places/stats - Get comprehensive statistics about places
export async function GET() {
  try {
    // Get total count
    const total = await prisma.place.count()

    // Get all places to calculate statistics (for MongoDB it's more efficient than multiple groupBy)
    const allPlaces = await prisma.place.findMany({
      select: {
        category: true,
        governorate: true,
        rating: true,
        reviews: true,
        phoneNumber: true,
        website: true,
      },
    })

    // Calculate category statistics
    const categoryMap = new Map<string, number>()
    allPlaces.forEach((place: any) => {
      categoryMap.set(place.category, (categoryMap.get(place.category) || 0) + 1)
    })
    const categoryStats = Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)

    // Calculate governorate statistics
    const governorateMap = new Map<string, number>()
    allPlaces.forEach((place: any) => {
      governorateMap.set(place.governorate, (governorateMap.get(place.governorate) || 0) + 1)
    })
    const governorateStats = Array.from(governorateMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)

    // Calculate rating distribution
    const ratingMap = new Map<number, number>()
    allPlaces.forEach((place: any) => {
      const rating = Math.round(place.rating * 2) / 2 // Round to nearest 0.5
      ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1)
    })
    const ratingDistribution = Array.from(ratingMap.entries())
      .map(([rating, count]) => ({
        rating,
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.rating - a.rating)

    // Calculate contact info statistics
    const withPhone = allPlaces.filter((p: any) => p.phoneNumber && p.phoneNumber.trim() !== '').length
    const withWebsite = allPlaces.filter((p: any) => p.website && p.website.trim() !== '').length
    const withBoth = allPlaces.filter((p: any) => 
      p.phoneNumber && p.phoneNumber.trim() !== '' && 
      p.website && p.website.trim() !== ''
    ).length

    // Calculate aggregates
    const ratings = allPlaces.map((p: any) => p.rating).filter((r: any) => r > 0)
    const reviews = allPlaces.map((p: any) => p.reviews).filter((r: any) => r > 0)
    
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((a: any, b: any) => a + b, 0) / ratings.length).toFixed(2)
      : '0.00'
    
    const averageReviews = reviews.length > 0
      ? Math.round(reviews.reduce((a: any, b: any) => a + b, 0) / reviews.length)
      : 0

    const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0
    const minRating = ratings.length > 0 ? Math.min(...ratings) : 0
    const maxReviews = reviews.length > 0 ? Math.max(...reviews) : 0
    const minReviews = reviews.length > 0 ? Math.min(...reviews) : 0

    const topRated = allPlaces.filter((p: any) => p.rating >= 4.5).length
    const highlyReviewed = allPlaces.filter((p: any) => p.reviews >= 100).length

    return NextResponse.json({
      total,
      categories: categoryStats,
      governorates: governorateStats,
      ratingDistribution,
      contactInfo: {
        withPhone,
        withWebsite,
        withBoth,
        percentageWithPhone: ((withPhone / total) * 100).toFixed(1),
        percentageWithWebsite: ((withWebsite / total) * 100).toFixed(1),
        percentageWithBoth: ((withBoth / total) * 100).toFixed(1),
      },
      aggregates: {
        averageRating,
        averageReviews,
        maxRating,
        minRating,
        maxReviews,
        minReviews,
        topRatedCount: topRated,
        topRatedPercentage: ((topRated / total) * 100).toFixed(1),
        highlyReviewedCount: highlyReviewed,
        highlyReviewedPercentage: ((highlyReviewed / total) * 100).toFixed(1),
      },
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
