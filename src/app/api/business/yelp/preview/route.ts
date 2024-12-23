import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const business = await prisma.business.findFirst({
      where: { 
        owner: {
          email: session.user.email
        }
      }
    })

    if (!business?.yelpId) {
      return NextResponse.json(
        { error: 'No Yelp business connected' },
        { status: 400 }
      )
    }

    // Fetch business details from Yelp
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/${business.yelpId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Yelp data' },
        { status: response.status }
      )
    }

    const yelpData = await response.json()

    // Fetch a sample review
    const reviewsResponse = await fetch(
      `https://api.yelp.com/v3/businesses/${business.yelpId}/reviews?limit=1&sort_by=date`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    )

    const reviewsData = await reviewsResponse.json()
    const sampleReview = reviewsData.reviews?.[0]

    return NextResponse.json({
      totalReviews: yelpData.review_count,
      rating: yelpData.rating,
      reviewSample: sampleReview ? {
        text: sampleReview.text,
        rating: sampleReview.rating,
        author: sampleReview.user.name,
        date: new Date(sampleReview.time_created).toLocaleDateString()
      } : undefined
    })

  } catch (error) {
    console.error('Error fetching Yelp preview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Yelp preview' },
      { status: 500 }
    )
  }
} 