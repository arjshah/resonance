import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get the first business (for testing purposes)
    const business = await prisma.business.findFirst()
    
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 404 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        businessId: business.id
      },
      orderBy: {
        reviewDate: 'desc'
      },
      take: limit,
      skip: skip
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}