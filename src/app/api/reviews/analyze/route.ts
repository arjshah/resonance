import { prisma } from "@/lib/prisma"
import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function GET() {
  try {
    // Verify OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Get the first business
    const business = await prisma.business.findFirst()
    if (!business) {
      console.error('No business found')
      return NextResponse.json(
        { error: 'No business found' },
        { status: 404 }
      )
    }

    // Fetch reviews
    const reviews = await prisma.review.findMany({
      where: { businessId: business.id },
      orderBy: { reviewDate: 'desc' },
      take: 50
    })

    if (reviews.length === 0) {
      console.error('No reviews found')
      return NextResponse.json(
        { error: 'No reviews found' },
        { status: 404 }
      )
    }

    console.log(`Analyzing ${reviews.length} reviews`)

    // Format reviews for analysis
    const reviewsForAnalysis = reviews.map(review => ({
      text: review.text,
      rating: review.rating,
      date: review.reviewDate.toISOString()
    }))

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing customer reviews and providing business insights."
          },
          {
            role: "user",
            content: `Analyze these customer reviews and provide insights in the following JSON structure:
              {
                "summary": {
                  "text": "Brief summary of overall sentiment",
                  "sentiment": "positive" | "neutral" | "negative"
                },
                "rating": {
                  "current": number,
                  "previous": number,
                  "trend": "up" | "down" | "stable"
                },
                "topics": [
                  {
                    "name": "Topic name",
                    "sentiment": "positive" | "neutral" | "negative",
                    "frequency": number (percentage),
                    "examples": ["example quote 1", "example quote 2"]
                  }
                ],
                "improvements": [
                  {
                    "area": "Area for improvement",
                    "description": "Detailed description",
                    "priority": "high" | "medium" | "low"
                  }
                ]
              }
              
              Reviews to analyze: ${JSON.stringify(reviewsForAnalysis)}`
          }
        ],
        response_format: { type: "json_object" }
      })

      const analysis = JSON.parse(completion.choices[0].message.content)
      console.log('Analysis completed successfully')
      
      return NextResponse.json(analysis)
    } catch (openAiError) {
      console.error('OpenAI API error:', openAiError)
      return NextResponse.json(
        { error: 'Failed to analyze reviews with AI' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in analyze route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}