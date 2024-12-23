import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const sessionToken = cookies().get('session')?.value
    
    if (sessionToken) {
      // Delete session from database
      await prisma.session.delete({
        where: { sessionToken }
      })
    }

    // Clear the session cookie
    cookies().delete('session')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
} 