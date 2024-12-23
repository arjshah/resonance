import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const business = await db.business.findFirst({
      where: {
        owner: {
          email: session.user.email
        }
      },
      select: {
        name: true,
        city: true,
        state: true,
        industry: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error("Error fetching business info:", error)
    return NextResponse.json(
      { error: 'Failed to fetch business info' },
      { status: 500 }
    )
  }
} 