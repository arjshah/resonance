import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First get the user
    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        business: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return empty object if no business exists
    if (!user.business) {
      return NextResponse.json({});
    }

    return NextResponse.json(user.business);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // First get or create the user
    const user = await db.user.upsert({
      where: {
        email: session.user.email
      },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || ''
      }
    });

    // Then upsert the business
    const business = await db.business.upsert({
      where: {
        ownerId: user.id
      },
      update: {
        ...data,
        updatedAt: new Date()
      },
      create: {
        ...data,
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error saving business profile:', error);
    return NextResponse.json(
      { error: 'Failed to save business profile' },
      { status: 500 }
    );
  }
} 