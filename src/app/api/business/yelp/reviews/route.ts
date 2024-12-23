import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await db.business.findFirst({
      where: { 
        owner: {
          email: session.user.email
        }
      },
      select: {
        yelpId: true
      }
    })

    if (!business?.yelpId) {
      return NextResponse.json({ error: 'No Yelp business connected' }, { status: 400 })
    }

    const response = await fetch(
      `https://api.yelp.com/v3/businesses/${business.yelpId}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Yelp API error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to fetch reviews from Yelp',
        details: 'The Yelp API is currently unavailable'
      }, { status: 503 })
    }

    const data = await response.json()
    
    return NextResponse.json({
      reviews: data.reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        authorName: r.user.name,
        reviewDate: r.time_created,
        url: r.url
      }))
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
} 