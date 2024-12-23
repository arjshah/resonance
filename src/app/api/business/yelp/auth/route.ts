import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { getUserLocation } from "@/lib/location"

const YELP_API_KEY = process.env.YELP_API_KEY!
const DEFAULT_LOCATION = 'San Francisco, CA' // Fallback location

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's business and location
    const [business, userLocation] = await Promise.all([
      db.business.findFirst({
        where: { 
          owner: {
            email: session.user.email
          }
        }
      }),
      getUserLocation(request)
    ])

    if (!business) {
      return NextResponse.json(
        { error: 'No business found for this user' },
        { status: 404 }
      )
    }

    // Use business location, user location, or default location
    const searchLocation = business.city && business.state 
      ? `${business.city}, ${business.state}`
      : userLocation || DEFAULT_LOCATION

    // Verify the API key works by making a test call
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(searchLocation)}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      console.error('Yelp API Error:', await response.text())
      return NextResponse.json(
        { 
          error: 'Failed to validate Yelp API key',
          location: searchLocation 
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ 
      success: true,
      business: {
        id: business.id,
        name: business.name
      },
      location: searchLocation
    })

  } catch (error) {
    console.error('Error validating Yelp API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to Yelp API',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
} 