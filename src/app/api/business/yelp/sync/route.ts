import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"

const YELP_API_KEY = process.env.YELP_API_KEY!
const REVIEW_LIMIT = 50
const REVIEWS_PER_PAGE = 50
const MAX_PAGES = 5  // This will fetch up to 250 reviews

// Add rate limiting
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const MAX_SYNCS_PER_DAY = 5 // Limit to 5 syncs per day

export async function POST() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the business
    const business = await db.business.findFirst({
      where: { 
        owner: {
          email: session.user.email
        }
      },
      select: {
        id: true,
        yelpId: true,
        lastYelpSync: true,
        yelpReviewCount: true
      }
    })

    if (!business?.yelpId) {
      return NextResponse.json({ error: 'Business not connected to Yelp' }, { status: 400 })
    }

    // Check rate limiting
    const recentSyncs = await db.syncLog.count({
      where: {
        businessId: business.id,
        source: 'yelp',
        timestamp: {
          gte: new Date(Date.now() - RATE_LIMIT_WINDOW)
        }
      }
    })

    if (recentSyncs >= MAX_SYNCS_PER_DAY) {
      return NextResponse.json({
        error: 'Rate limit exceeded. Please try again later.',
        details: `Limited to ${MAX_SYNCS_PER_DAY} syncs per day to respect Yelp's API limits.`
      }, { status: 429 })
    }

    // Add delay if last sync was recent
    if (business.lastYelpSync) {
      const timeSinceLastSync = Date.now() - business.lastYelpSync.getTime()
      if (timeSinceLastSync < 60000) { // 1 minute
        return NextResponse.json({
          error: 'Please wait a moment before syncing again',
          details: 'Minimum 1 minute between syncs'
        }, { status: 429 })
      }
    }

    console.log(`Starting Yelp sync for business: ${business.id} (Total Yelp Reviews: ${business.yelpReviewCount})`)
    console.log('Note: Yelp API limits access to the 3 most recent reviews')

    const reviewsResponse = await fetch(
      `https://api.yelp.com/v3/businesses/${business.yelpId}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!reviewsResponse.ok) {
      const errorText = await reviewsResponse.text()
      console.error('Yelp API error:', errorText)
      
      // Parse error response
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.code === 'ACCESS_LIMIT_REACHED') {
          return NextResponse.json({
            error: 'Yelp API rate limit reached',
            details: 'Please try again in a few hours'
          }, { status: 429 })
        }
      } catch (e) {
        // Ignore JSON parse error
      }

      return NextResponse.json({ 
        error: 'Failed to fetch reviews from Yelp',
        details: 'The Yelp API is currently unavailable. Please try again later.'
      }, { status: 503 })
    }

    const reviewsData = await reviewsResponse.json()
    console.log(`Received ${reviewsData.reviews.length} most recent reviews from Yelp`)

    let syncedCount = 0
    const startTime = Date.now()

    // Process reviews
    for (const review of reviewsData.reviews) {
      try {
        const result = await db.review.upsert({
          where: {
            businessId_source_sourceReviewId: {
              businessId: business.id,
              source: 'yelp',
              sourceReviewId: review.id
            }
          },
          update: {
            rating: review.rating,
            text: review.text,
            authorName: review.user.name,
            reviewDate: new Date(review.time_created),
            sourceUrl: review.url,
            lastSynced: new Date()
          },
          create: {
            businessId: business.id,
            source: 'yelp',
            sourceReviewId: review.id,
            rating: review.rating,
            text: review.text,
            authorName: review.user.name,
            reviewDate: new Date(review.time_created),
            sourceUrl: review.url,
            lastSynced: new Date()
          }
        })
        console.log('Synced review:', result.id)
        syncedCount++
      } catch (error) {
        console.error('Error syncing review:', error)
      }
    }

    const duration = Date.now() - startTime

    // Update business last sync time and review count
    await db.business.update({
      where: { id: business.id },
      data: { 
        lastYelpSync: new Date(),
        yelpReviewCount: business.yelpReviewCount // Keep the total count from business info
      }
    })

    // Log the sync
    await db.syncLog.create({
      data: {
        businessId: business.id,
        source: 'yelp',
        status: 'success',
        reviewsSynced: syncedCount,
        duration,
        timestamp: new Date()
      }
    })

    console.log(`Sync completed: ${syncedCount} reviews synced in ${duration}ms`)

    return NextResponse.json({
      success: true,
      syncedReviews: syncedCount,
      duration,
      note: 'Due to Yelp API limitations, only the 3 most recent reviews can be synced'
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { 
        error: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}