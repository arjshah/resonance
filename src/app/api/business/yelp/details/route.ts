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
      return NextResponse.json({ error: 'Business not connected to Yelp' }, { status: 400 })
    }

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
      throw new Error('Failed to fetch business details from Yelp')
    }

    const data = await response.json()

    return NextResponse.json({
      name: data.name,
      rating: data.rating,
      reviewCount: data.review_count,
      url: data.url,
      photos: data.photos,
      address: data.location.address1,
      phone: data.display_phone
    })

  } catch (error) {
    console.error('Error fetching business details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business details' },
      { status: 500 }
    )
  }
} 