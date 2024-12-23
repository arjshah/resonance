import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    // Get session using our new helper
    const session = await getSession()
    console.log('Session data:', {
      exists: !!session,
      userId: session?.user?.id
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { businessId, businessUrl } = await request.json()
    
    if (!businessId || !businessUrl) {
      return NextResponse.json(
        { error: 'Business ID and URL are required' },
        { status: 400 }
      )
    }

    // Get the authenticated user's business
    const business = await prisma.business.findUnique({
      where: {
        ownerId: session.user.id
      }
    })

    console.log('Found business:', {
      exists: !!business,
      businessId: business?.id,
      ownerId: business?.ownerId
    })

    // If no business found, let's check the user record
    if (!business) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { business: true }
      })
      console.log('User details:', {
        exists: !!user,
        userId: user?.id,
        hasBusiness: !!user?.business
      })

      return NextResponse.json(
        { error: 'No business found for authenticated user. Please create a business profile first.' },
        { status: 404 }
      )
    }

    // Get the business owner's details from Yelp
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/${businessId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Yelp API error:', {
        status: response.status,
        error: errorData
      })
      throw new Error(
        errorData.error?.description || 
        `Failed to verify business with Yelp (${response.status})`
      )
    }

    const yelpBusiness = await response.json()

    if (!yelpBusiness.id || !yelpBusiness.url) {
      console.error('Invalid Yelp business data:', {
        hasId: !!yelpBusiness.id,
        hasUrl: !!yelpBusiness.url
      })
      throw new Error('Invalid business data received from Yelp')
    }

    // Enhanced verification logic
    let isVerified = false
    const verificationMethods: string[] = []

    // Check URL match
    const normalizeUrl = (url: string) => url.split('?')[0].replace(/\/$/, '')
    const normalizedYelpUrl = normalizeUrl(yelpBusiness.url)
    const normalizedProvidedUrl = normalizeUrl(businessUrl)
    
    console.log('URL verification:', {
      yelpUrl: normalizedYelpUrl,
      providedUrl: normalizedProvidedUrl
    })

    if (normalizedYelpUrl === normalizedProvidedUrl) {
      isVerified = true
      verificationMethods.push('URL match')
    }

    // Check phone match (if available)
    if (!isVerified && business.phone && yelpBusiness.phone) {
      const normalizePhone = (phone: string) => phone.replace(/\D/g, '')
      const normalizedBusinessPhone = normalizePhone(business.phone)
      const normalizedYelpPhone = normalizePhone(yelpBusiness.phone)
      
      console.log('Phone verification:', {
        businessPhone: normalizedBusinessPhone,
        yelpPhone: normalizedYelpPhone
      })

      if (normalizedBusinessPhone === normalizedYelpPhone) {
        isVerified = true
        verificationMethods.push('phone number match')
      }
    }

    // Check address match (if available)
    if (!isVerified && business.address && yelpBusiness.location?.address1) {
      const normalizeAddress = (addr: string) => 
        addr.toLowerCase().replace(/[^\w\s]/g, '')
      
      const businessAddr = normalizeAddress(business.address)
      const yelpAddr = normalizeAddress(yelpBusiness.location.address1)
      
      console.log('Address verification:', {
        businessAddr,
        yelpAddr
      })
      
      if (businessAddr.includes(yelpAddr) || yelpAddr.includes(businessAddr)) {
        isVerified = true
        verificationMethods.push('address match')
      }
    }

    if (!isVerified) {
      console.log('Verification failed:', {
        methods: verificationMethods,
        business: {
          phone: !!business.phone,
          address: !!business.address
        },
        yelp: {
          phone: !!yelpBusiness.phone,
          address: !!yelpBusiness.location?.address1
        }
      })

      return NextResponse.json(
        { 
          error: 'Unable to verify business ownership. Please ensure you have claimed this business on Yelp and that your business details match your Yelp listing.',
          details: 'We attempt to verify ownership through matching URLs, phone numbers, or addresses.'
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ 
      verified: true,
      message: `Business verification successful via ${verificationMethods.join(' and ')}`,
      businessId: yelpBusiness.id
    })

  } catch (error) {
    console.error('Error verifying business:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to verify business ownership',
        details: 'Please try again or contact support if the issue persists.'
      },
      { status: 500 }
    )
  }
}