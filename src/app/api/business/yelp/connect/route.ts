import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mapYelpBusinessToDatabase } from "@/lib/yelp/mapper"
import { getSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    // Get session using our new helper
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { businessData } = await request.json()

    // Get the authenticated user's business
    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'No business found for authenticated user' },
        { status: 404 }
      )
    }

    // First check if another business already has this Yelp ID
    const existingBusiness = await prisma.business.findUnique({
      where: { yelpBusinessId: businessData.id }
    })

    if (existingBusiness && existingBusiness.id !== business.id) {
      return NextResponse.json(
        { error: 'This Yelp business is already connected to another account' },
        { status: 400 }
      )
    }

    // Map the Yelp data to our database schema
    const mappedData = mapYelpBusinessToDatabase(businessData)

    // Update business with mapped Yelp details
    const updatedBusiness = await prisma.business.update({
      where: { 
        id: business.id 
      },
      data: {
        // Only update fields if they're not already set
        ...Object.fromEntries(
          Object.entries(mappedData).map(([key, value]) => [
            key,
            business[key] || value
          ])
        ),
        updatedAt: new Date() // Add this to ensure updatedAt is set
      }
    })

    return NextResponse.json({ 
      success: true,
      business: updatedBusiness 
    })
  } catch (error) {
    console.error('Error connecting Yelp business:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect Yelp business' },
      { status: 500 }
    )
  }
}