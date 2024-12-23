import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"

export async function GET() {
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

    // Return empty history if no syncs yet
    const syncHistory = await db.syncLog.findMany({
      where: {
        businessId: business.id,
        source: 'yelp'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    }) || []

    return NextResponse.json({ history: syncHistory })

  } catch (error) {
    console.error('Error fetching sync history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync history' },
      { status: 500 }
    )
  }
} 