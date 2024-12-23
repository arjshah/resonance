import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This will handle fetching business details from Google Places API
async function fetchGoogleBusinessDetails(placeId: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,url&key=${process.env.GOOGLE_PLACES_API_KEY}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch business details from Google')
  }

  const data = await response.json()
  return data.result
}

export async function POST(request: Request) {
  try {
    const { placeId } = await request.json()
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    // Fetch business details from Google Places API
    const googleDetails = await fetchGoogleBusinessDetails(placeId)

    // Get the first business (we'll update this to use the authenticated user's business later)
    const business = await prisma.business.findFirst()
    
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 404 }
      )
    }

    // Update business with Google details
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        googlePlaceId: placeId,
        googleBusinessName: googleDetails.name,
        googleBusinessUrl: googleDetails.url,
        name: googleDetails.name,
        address: googleDetails.formatted_address,
        phone: googleDetails.formatted_phone_number,
        website: googleDetails.website,
      }
    })

    return NextResponse.json({ business: updatedBusiness })
  } catch (error) {
    console.error('Error connecting Google Business:', error)
    return NextResponse.json(
      { error: 'Failed to connect Google Business Profile' },
      { status: 500 }
    )
  }
} 