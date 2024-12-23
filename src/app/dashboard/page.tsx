'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { PageTransition } from "@/components/layout/page-transition"
import { BusinessQuickView } from "@/components/dashboard/business/business-quick-view"

export default function DashboardPage() {
  return (
    <PageTransition className="min-h-screen">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-light">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your business overview and insights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 border-0 bg-white dark:bg-gray-950">
            <CardHeader>
              <CardTitle className="text-xl font-light">Review Trends</CardTitle>
              <CardDescription>
                Monthly review volume over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <div className="md:col-span-3 space-y-6">
            <BusinessQuickView 
              name="Coastal Cafe & Bakery"
              location="San Francisco, CA"
            />
            
            <Card className="border-0 bg-white dark:bg-gray-950">
              <CardHeader>
                <CardTitle className="text-xl font-light">Latest Reviews</CardTitle>
                <CardDescription>
                  Recent customer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentReviews />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}