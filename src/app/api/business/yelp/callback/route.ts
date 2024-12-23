import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    // Verify state matches what we stored
    const storedState = cookies().get('yelp_oauth_state')?.value
    if (!storedState || state !== storedState) {
      throw new Error('Invalid state parameter')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.yelp.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code!,
        client_id: process.env.YELP_CLIENT_ID!,
        client_secret: process.env.YELP_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/business/yelp/callback`
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()

    // Store the access token in your database
    await db.user.update({
      where: { id: userId },
      data: {
        yelpAccessToken: tokenData.access_token,
        yelpTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
      }
    })

    // Clear the state cookie
    cookies().delete('yelp_oauth_state')

    // Redirect back to the dashboard with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?yelp=connected`
    )

  } catch (error) {
    console.error('Yelp callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?yelp=error`
    )
  }
} 