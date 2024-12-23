import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the authenticated user's business
    const business = await db.business.findFirst({
      where: { 
        owner: {
          email: session.user.email
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 404 }
      )
    }

    // Update business to remove Yelp connection details
    const updatedBusiness = await db.business.update({
      where: { id: business.id },
      data: {
        yelpId: null,
        yelpUrl: null,
        yelpRating: null,
        yelpReviewCount: null,
        lastYelpSync: null,
        updatedAt: new Date()
      }
    })

    // Also mark all Yelp reviews as disconnected or delete them
    // Depending on your requirements, you might want to:
    // 1. Delete all Yelp reviews
    // 2. Keep them but mark them as disconnected
    // 3. Keep them as historical data
    await db.review.deleteMany({
      where: {
        businessId: business.id,
        source: 'yelp'
      }
    })

    console.log('Disconnected Yelp integration for business:', business.id)

    return NextResponse.json({ 
      success: true,
      message: 'Yelp connection removed successfully'
    })

  } catch (error) {
    console.error('Error disconnecting Yelp:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Yelp integration' },
      { status: 500 }
    )
  }
} 