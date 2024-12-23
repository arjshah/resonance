import { db } from '@/lib/db'

async function migrateBusiness() {
  try {
    // 1. Constants from our data
    const GOOGLE_USER_ID = 'cm50ap1ec000b9klk2765wkw4'
    const TEST_USER_ID = 'cm50abv3900009kobvd5ea0ee'
    const BUSINESS_ID = 'cm50abv4a00029kobc96hx92w'

    console.log('Starting business ownership migration...')

    // 2. Verify the business and its current state
    const business = await db.business.findUnique({
      where: { id: BUSINESS_ID },
      include: {
        owner: true,
        reviews: true
      }
    })

    if (!business) {
      throw new Error('Business not found')
    }

    console.log('Current business state:', {
      name: business.name,
      currentOwner: business.owner.email,
      reviewCount: business.reviews.length
    })

    // 3. Update the business owner
    const updatedBusiness = await db.business.update({
      where: { id: BUSINESS_ID },
      data: { ownerId: GOOGLE_USER_ID },
      include: {
        owner: true,
        reviews: true
      }
    })

    console.log('Successfully migrated business:', {
      name: updatedBusiness.name,
      newOwner: updatedBusiness.owner.email,
      reviewCount: updatedBusiness.reviews.length
    })

  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

migrateBusiness() 