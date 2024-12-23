import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const business = await db.business.findFirst({
      where: { 
        owner: {
          email: session.user.email
        }
      },
      select: {
        id: true,
        yelpReviewCount: true,
        lastYelpSync: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Count synced reviews
    const syncedCount = await db.review.count({
      where: {
        businessId: business.id,
        source: 'yelp'
      }
    })

    // Get last sync time
    const lastSync = await db.syncLog.findFirst({
      where: {
        businessId: business.id,
        source: 'yelp',
        status: 'success'
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    return NextResponse.json({
      totalReviews: business.yelpReviewCount || 0,
      syncedCount,
      lastSyncedAt: lastSync?.timestamp || business.lastYelpSync
    })

  } catch (error) {
    console.error('Error fetching sync stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync stats' },
      { status: 500 }
    )
  }
} 