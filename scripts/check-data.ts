import { db } from '@/lib/db'

async function checkData() {
  try {
    // 1. Get both users with their businesses
    const googleUser = await db.user.findUnique({
      where: { email: 'arjunshah3010@gmail.com' },
      include: {
        business: true,
        team: true
      }
    })

    const testUser = await db.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        business: true,
        team: true
      }
    })

    // 2. Get the business with all relations
    const business = await db.business.findFirst({
      include: {
        owner: true,
        team: true,
        customers: true,
        reviews: true,
        workflows: true
      }
    })

    console.log('\n=== Users ===')
    console.log('Google User:', {
      id: googleUser?.id,
      email: googleUser?.email,
      hasBusiness: !!googleUser?.business,
      teamMemberships: googleUser?.team.length
    })

    console.log('\nTest User:', {
      id: testUser?.id,
      email: testUser?.email,
      hasBusiness: !!testUser?.business,
      teamMemberships: testUser?.team.length
    })

    console.log('\n=== Business ===')
    console.log({
      id: business?.id,
      name: business?.name,
      currentOwnerId: business?.ownerId,
      ownerEmail: business?.owner.email,
      teamMembers: business?.team.length,
      customers: business?.customers.length,
      reviews: business?.reviews.length,
      workflows: business?.workflows.length
    })

  } catch (error) {
    console.error('Error checking data:', error)
    process.exit(1)
  }
}

checkData()