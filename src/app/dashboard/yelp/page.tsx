import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { YelpBusinessCard } from "@/components/dashboard/yelp/business-card"
import { YelpReviewsCard } from "@/components/dashboard/yelp/reviews-card"
import { YelpSyncCard } from "@/components/dashboard/yelp/sync-card"

export const metadata: Metadata = {
  title: "Yelp Integration",
  description: "Manage your Yelp business connection and review sync"
}

export default function YelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light">Yelp Integration</h1>
        <p className="text-sm text-muted-foreground">
          Connect and manage your Yelp business reviews
        </p>
      </div>

      <div className="grid gap-6">
        <YelpBusinessCard />
        <div className="grid gap-6 md:grid-cols-2">
          <YelpReviewsCard />
          <YelpSyncCard />
        </div>
      </div>
    </div>
  )
}