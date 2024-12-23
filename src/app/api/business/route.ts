import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the first business (we'll update this to use the authenticated user's business later)
    const business = await prisma.business.findFirst()
    
    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
} 