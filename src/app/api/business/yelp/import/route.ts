import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  let business = null
  let yelpDetails = null

  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's business
    business = await db.business.findFirst({
      where: { 
        owner: {
          email: session.user.email
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'No business found for this user' },
        { status: 404 }
      )
    }

    // Search for the business on Yelp using business details
    const searchQuery = encodeURIComponent(business.name || '')
    const searchLocation = encodeURIComponent(`${business.city || ''}, ${business.state || ''}`)
    
    const searchResponse = await fetch(
      `https://api.yelp.com/v3/businesses/search?term=${searchQuery}&location=${searchLocation}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!searchResponse.ok) {
      console.error('Yelp search error:', await searchResponse.text())
      return NextResponse.json(
        { error: 'Failed to find business on Yelp' },
        { status: searchResponse.status }
      )
    }

    const searchData = await searchResponse.json()
    if (!searchData.businesses?.length) {
      return NextResponse.json(
        { error: 'Business not found on Yelp' },
        { status: 404 }
      )
    }

    const yelpBusinessId = searchData.businesses[0].id

    // Get detailed business info
    const detailsResponse = await fetch(
      `https://api.yelp.com/v3/businesses/${yelpBusinessId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!detailsResponse.ok) {
      console.error('Yelp details error:', await detailsResponse.text())
      return NextResponse.json(
        { error: 'Failed to get business details from Yelp' },
        { status: detailsResponse.status }
      )
    }

    yelpDetails = await detailsResponse.json()

    console.log('Updating business with Yelp details:', {
      businessId: business.id,
      yelpDetails: {
        id: yelpDetails.id,
        url: yelpDetails.url,
        rating: yelpDetails.rating,
        reviewCount: yelpDetails.review_count
      }
    })

    // Update business with Yelp details using the correct field names from schema
    const updatedBusiness = await db.business.update({
      where: { id: business.id },
      data: {
        yelpId: yelpDetails.id,
        yelpUrl: yelpDetails.url,
        yelpRating: parseFloat(yelpDetails.rating),  // Convert to float as per schema
        yelpReviewCount: parseInt(yelpDetails.review_count),  // Convert to integer
        lastYelpSync: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Business updated successfully:', {
      id: updatedBusiness.id,
      yelpId: updatedBusiness.yelpId
    })

    return NextResponse.json({ 
      success: true,
      business: updatedBusiness
    })

  } catch (error) {
    console.error('Error importing business:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      businessId: business?.id,
      yelpDetails: yelpDetails ? {
        id: yelpDetails.id,
        name: yelpDetails.name
      } : undefined
    })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to import business',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}