import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function getGoogleAccessToken(code: string) {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: 'postmessage', // For popup mode
      grant_type: 'authorization_code',
    }),
  })

  return tokenResponse.json()
}

async function getBusinessInfo(accessToken: string) {
  console.log('Fetching business accounts...')
  
  // Increase initial delay and max retries
  const maxRetries = 5
  let retryCount = 0
  let delay = 2000 // Start with 2 second delay

  while (retryCount < maxRetries) {
    try {
      // Add a small delay before the first request
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const accountsResponse = await fetch(
        'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Accounts Response Status:', accountsResponse.status)
      
      if (accountsResponse.status === 429) {
        console.log(`Rate limited. Retry ${retryCount + 1} of ${maxRetries}`)
        retryCount++
        if (retryCount === maxRetries) {
          throw new Error('API_QUOTA_EXCEEDED')
        }
        delay *= 2 // Exponential backoff
        continue
      }

      const accounts = await accountsResponse.json()
      console.log('Accounts Data:', accounts)

      if (!accounts.accounts || accounts.accounts.length === 0) {
        throw new Error('NO_BUSINESS_PROFILE')
      }

      const account = accounts.accounts[0] // Get the first account
      console.log('Selected Account:', account)

      // Then get the business locations
      console.log('Fetching locations for account:', account.name)
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Locations Response Status:', locationsResponse.status)
      const locationsData = await locationsResponse.json()
      console.log('Locations Data:', locationsData)

      // Check if locations exist
      if (!locationsData.locations || locationsData.locations.length === 0) {
        console.log('No business locations found')
        throw new Error('NO_BUSINESS_LOCATIONS')
      }

      return locationsData
    } catch (error) {
      if (error.message === 'API_QUOTA_EXCEEDED' || retryCount === maxRetries - 1) {
        console.log('API quota exceeded after retries')
        throw new Error('API_QUOTA_EXCEEDED')
      }
      throw error
    }
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    console.log('Received auth code')

    // Exchange code for access token
    console.log('Exchanging code for token...')
    const tokenData = await getGoogleAccessToken(code)
    console.log('Token received:', tokenData.access_token ? 'Yes' : 'No')
    
    try {
      // Get business information
      const businessInfo = await getBusinessInfo(tokenData.access_token)
      
      const location = businessInfo.locations[0] // Get the first location

      // Get the first business (we'll update this to use the authenticated user's business later)
      const business = await prisma.business.findFirst()
      
      if (!business) {
        return NextResponse.json(
          { error: 'No business found in database' },
          { status: 404 }
        )
      }

      // Update business with Google Business Profile data
      const updatedBusiness = await prisma.business.update({
        where: { id: business.id },
        data: {
          name: location.locationName,
          address: location.address.addressLines.join(', '),
          phone: location.phoneNumbers?.primary || null,
          website: location.websiteUri || null,
          googleBusinessName: location.locationName,
          googleBusinessUrl: location.websiteUri,
        }
      })

      return NextResponse.json({ business: updatedBusiness })
    } catch (error) {
      if (error.message === 'API_QUOTA_EXCEEDED') {
        return NextResponse.json(
          { error: 'API_QUOTA_EXCEEDED', message: 'Please try again in a few minutes' },
          { status: 429 }
        )
      }
      if (error.message === 'NO_BUSINESS_PROFILE') {
        return NextResponse.json(
          { error: 'NO_BUSINESS_PROFILE', message: 'No business profile found for this account' },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error connecting Google Business:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to connect Google Business Profile' },
      { status: 500 }
    )
  }
} 