import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getSession() {
  try {
    // Create cookies instance first
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session')?.value
    
    if (!sessionToken) {
      return null
    }

    // Find session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    })

    if (!session) {
      return null
    }

    // Check if session is expired
    if (session.expires < new Date()) {
      return null
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      }
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}