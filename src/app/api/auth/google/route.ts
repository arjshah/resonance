// app/api/auth/google/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/encryption' // You'll need to create this

export async function POST(request: Request) {
  try {
    const { credential } = await request.json()

    // Debug log
    console.log('Starting Google auth...')

    // Decode the JWT token to get user info
    const decoded = JSON.parse(
      Buffer.from(credential.split('.')[1], 'base64').toString()
    )

    console.log('Decoded token:', { email: decoded.email, name: decoded.name })

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email: decoded.email },
      update: {
        name: decoded.name,
        image: decoded.picture,
        lastLoginAt: new Date(),
      },
      create: {
        email: decoded.email,
        name: decoded.name,
        image: decoded.picture,
        lastLoginAt: new Date(),
      },
    })

    console.log('User upserted:', { userId: user.id, email: user.email })

    // Create a new session
    const session = await prisma.session.create({
      data: {
        sessionToken: crypto.randomUUID(),
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
      }
    })

    console.log('Session created:', { 
      sessionId: session.id,
      token: session.sessionToken,
      expires: session.expires 
    })

    // Set the session cookie
    await cookies().set('session', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })

    console.log('Session cookie set')

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in Google auth:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}