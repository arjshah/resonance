import { db } from '@/lib/db'

async function fixUserSession() {
  try {
    // Find both users
    const googleUser = await db.user.findUnique({
      where: { email: 'arjunshah3010@gmail.com' },
      include: { accounts: true }
    })

    const testUser = await db.user.findUnique({
      where: { email: 'test@example.com' },
      include: { accounts: true }
    })

    if (!googleUser) {
      throw new Error('Google user not found')
    }

    // Update the session table to use the Google account
    await db.session.updateMany({
      where: { userId: testUser?.id },
      data: { userId: googleUser.id }
    })

    console.log('Successfully updated session to use Google account')

  } catch (error) {
    console.error('Error fixing user session:', error)
    process.exit(1)
  }
}

fixUserSession() 