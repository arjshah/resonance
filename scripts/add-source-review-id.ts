import { db } from '@/lib/db'

async function addSourceReviewId() {
  try {
    console.log('Starting source review ID migration...')

    // 1. Get all Yelp reviews
    const yelpReviews = await db.review.findMany({
      where: { source: 'yelp' },
      select: {
        id: true,
        sourceUrl: true,
        sourceReviewId: true
      }
    })

    console.log(`Found ${yelpReviews.length} Yelp reviews`)

    // 2. Update reviews with sourceReviewId from URL
    let updatedCount = 0
    let legacyCount = 0

    for (const review of yelpReviews) {
      try {
        // Skip if already has sourceReviewId
        if (review.sourceReviewId) {
          continue
        }

        let sourceReviewId: string | null = null

        // Try to extract review ID from URL
        if (review.sourceUrl) {
          const match = review.sourceUrl.match(/review_id=([^&]+)/)
          if (match) {
            sourceReviewId = match[1]
          }
        }

        // If no URL or couldn't extract ID, generate a legacy ID
        if (!sourceReviewId) {
          sourceReviewId = `legacy_${review.id}`
          legacyCount++
        } else {
          updatedCount++
        }

        // Update the review
        await db.review.update({
          where: { id: review.id },
          data: { sourceReviewId }
        })

      } catch (error) {
        console.error(`Error updating review ${review.id}:`, error)
      }
    }

    console.log('\nMigration Summary:')
    console.log('------------------')
    console.log(`Total Yelp reviews: ${yelpReviews.length}`)
    console.log(`Reviews updated with Yelp IDs: ${updatedCount}`)
    console.log(`Reviews assigned legacy IDs: ${legacyCount}`)

    // 3. Verify unique constraint would work
    const duplicateCheck = await db.$queryRaw`
      SELECT "businessId", source, "sourceReviewId", COUNT(*)
      FROM "Review"
      WHERE "sourceReviewId" IS NOT NULL
      GROUP BY "businessId", source, "sourceReviewId"
      HAVING COUNT(*) > 1
    `

    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      console.log('\n⚠️ Warning: Found potential duplicate entries:')
      console.log(duplicateCheck)
    } else {
      console.log('\n✅ No duplicate entries found - safe to add unique constraint')
    }

  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

addSourceReviewId() 