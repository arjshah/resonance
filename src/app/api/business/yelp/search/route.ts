import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const term = searchParams.get('term')
    
    if (!term) {
      return NextResponse.json(
        { error: 'Search term is required' },
        { status: 400 }
      )
    }

    if (!process.env.YELP_API_KEY) {
      return NextResponse.json(
        { error: 'Yelp API key not configured' },
        { status: 500 }
      )
    }

    // Search businesses using Yelp Fusion API
    // Adding location parameter (we can make this dynamic later)
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?` + 
      `term=${encodeURIComponent(term)}&` +
      `location=San Francisco Bay Area&` + // Default location for now
      `sort_by=best_match&` +
      `limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error('Yelp API Error:', responseData)
      return NextResponse.json(
        { error: responseData.error?.description || 'Failed to search Yelp businesses' },
        { status: response.status }
      )
    }

    // Map the response to only include fields we need
    const businesses = responseData.businesses.map((business: any) => ({
      id: business.id,
      name: business.name,
      rating: business.rating,
      review_count: business.review_count,
      location: {
        address1: business.location.address1,
        city: business.location.city,
        state: business.location.state,
      },
      phone: business.display_phone,
      url: business.url,
    }))

    return NextResponse.json({ businesses })

  } catch (error) {
    console.error('Error searching Yelp businesses:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to search Yelp businesses'
      },
      { status: 500 }
    )
  }
} 