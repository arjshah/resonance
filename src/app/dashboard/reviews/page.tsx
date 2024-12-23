'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIInsights } from "@/components/dashboard/reviews/ai-insights"
import { ReviewsList } from "@/components/dashboard/reviews/reviews-list"
import { PageTransition } from "@/components/layout/page-transition"

export default function ReviewsPage() {
  return (
    <PageTransition className="min-h-screen">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-light">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of your customer reviews and feedback
          </p>
        </div>

        {/* AI Insights */}
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="text-xl font-light">Overview</CardTitle>
            <CardDescription>
              Key trends and analysis from your recent reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AIInsights />
          </CardContent>
        </Card>

        {/* Reviews List */}
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="text-xl font-light">Supporting Data</CardTitle>
            <CardDescription>
              Review history used for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewsList />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}