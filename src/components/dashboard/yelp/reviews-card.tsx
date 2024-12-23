'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, Loader2, AlertCircle, ExternalLink, RefreshCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useYelpConnection } from "@/hooks/use-yelp-connection"
import Image from "next/image"

interface YelpReview {
  id: string
  rating: number
  text: string
  authorName: string
  reviewDate: string
  url: string
}

interface YelpBusiness {
  name: string
  rating: number
  reviewCount: number
  url: string
  photos: string[]
  address: string
  phone: string
}

export function YelpReviewsCard() {
  const { business } = useYelpConnection()
  const [reviews, setReviews] = useState<YelpReview[]>([])
  const [yelpBusiness, setYelpBusiness] = useState<YelpBusiness | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Check if we have a business connected
        if (!business?.yelpId) {
          throw new Error('No Yelp business connected')
        }

        // Fetch both reviews and business details
        const [reviewsResponse, businessResponse] = await Promise.all([
          fetch('/api/business/yelp/reviews'),
          fetch('/api/business/yelp/details')
        ])

        // Log responses for debugging
        console.log('Reviews Response:', reviewsResponse.status)
        console.log('Business Response:', businessResponse.status)
        
        // Handle reviews response
        if (!reviewsResponse.ok) {
          const reviewsError = await reviewsResponse.json()
          console.error('Reviews error:', reviewsError)
          throw new Error(reviewsError.error || 'Failed to fetch Yelp reviews')
        }

        // Handle business response
        if (!businessResponse.ok) {
          const businessError = await businessResponse.json()
          console.error('Business error:', businessError)
          throw new Error(businessError.error || 'Failed to fetch Yelp business details')
        }
        
        // Parse successful responses
        const reviewsData = await reviewsResponse.json()
        const businessData = await businessResponse.json()

        if (!reviewsData.reviews) {
          console.error('Invalid reviews data:', reviewsData)
          throw new Error('Invalid response from Yelp reviews API')
        }

        if (!businessData) {
          console.error('Invalid business data:', businessData)
          throw new Error('Invalid response from Yelp business API')
        }
        
        setReviews(reviewsData.reviews)
        setYelpBusiness(businessData)

      } catch (err) {
        console.error('Error fetching Yelp data:', err)
        setError(err instanceof Error ? err.message : 'Unable to load Yelp data')
      } finally {
        setIsLoading(false)
      }
    }

    if (business?.yelpId) {
      fetchData()
    } else {
      setError('No Yelp business connected')
      setIsLoading(false)
    }
  }, [business?.yelpId])

  if (isLoading) {
    return (
      <Card className="transition-opacity duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-light">Recent Yelp Reviews</CardTitle>
            <CardDescription>Loading latest reviews...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Fetching latest reviews...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-light">Recent Yelp Reviews</CardTitle>
            <CardDescription>Unable to load reviews</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-[#FF1A1A] hover:text-[#FF1A1A] hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-stone-50 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-50 p-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Unable to Load Yelp Data</h3>
                <p className="text-sm text-muted-foreground max-w-[400px]">
                  {error === 'No Yelp business connected' 
                    ? "Please connect your Yelp business to view reviews."
                    : "We're having trouble connecting to Yelp. Please try again in a moment."}
                </p>
              </div>
              {error === 'No Yelp business connected' && (
                <Button 
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {/* Add your connection flow here */}}
                >
                  Connect Yelp Business
                </Button>
              )}
            </div>
          </div>

          {/* Placeholder Card */}
          <div className="rounded-lg border bg-gradient-to-br from-stone-50/50 to-white p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-32 bg-stone-100 rounded animate-pulse" />
              </div>
              <div className="h-16 w-16 rounded-lg bg-stone-100 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-stone-200"
                  />
                ))}
              </div>
              <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {error === 'No Yelp business connected' 
              ? "Connect your Yelp business to start syncing reviews"
              : "Reviews will appear here once we can reconnect to Yelp"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-light">Recent Yelp Reviews</CardTitle>
          <CardDescription>Latest reviews from your Yelp business page</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-[#FF1A1A] hover:text-[#FF1A1A] hover:bg-red-50"
          asChild
        >
          <a 
            href={yelpBusiness?.url} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.365-1.006-1.534-1.482-2.518-1.535-2.647-1.904-2.61-.184.024-.253.133-.253.375-.004.223-.004 2.136-.002 3.396.002 1.595-.185 2.04-.59 2.273-.235.135-.47.143-.739.023-.271-.121-1.09-.46-2.002-.997-2.555-1.495-4.712-3.781-5.897-5.973-.159-.293-.262-.572-.262-.815 0-.113.041-.244.122-.391.146-.264.42-.46.692-.495.44-.058 2.502-.06 2.502-.06s1.434-1.382 2.182-2.206c.151-.167.336-.367.336-.61 0-.243-.184-.412-.366-.561-.182-.149-1.509-1.021-1.509-1.021s-.154-.106-.273-.106c-.119 0-.24.054-.327.131-.863.757-3.582 3.158-3.736 3.296-.179.16-.215.195-.381.195-.165 0-.338-.021-.401-.048-.357-.151-1.544-.705-2.311-1.777 1.443-2.573 3.278-4.726 5.457-6.378.723-.551 1.528-1.053 2.497-1.461 2.672-1.129 5.445-1.22 6.944-.228.771.51 1.373 1.453 1.616 2.525.172.761.154 1.404-.123 1.99-.434.921-1.31 1.527-2.273 1.579-.278.015-.574-.062-.774-.232-.076-.065-.369-.309-.695-.888-.377-.673-.743-.972-1.075-.972-.331 0-.639.299-.639.299s.306.306.461.477c.453.5.648.982.648 1.572 0 .593-.201 1.069-.599 1.414-.201.175-.441.273-.687.273-.62 0-.676-.081-2.316-1.845-.038-.041-.121-.13-.121-.13s-1.189-1.333-1.189-1.333c-.053.371-.053.743.025 1.06.097.395.393.77.754 1.182.363.414 2.589 2.988 2.589 2.988s.306.351.306.707c0 .337-.229.63-.474.827-.244.197-2.072 1.579-2.072 1.579s.463.569.926 1.083c.459.512 2.52 3.695 2.52 3.695.118.182.118.316-.013.434z"/>
            </svg>
            View on Yelp
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Business Summary Card */}
        {yelpBusiness && (
          <div className="rounded-lg border bg-gradient-to-br from-white to-stone-50 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-semibold leading-tight">{yelpBusiness.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <p>{yelpBusiness.address}</p>
                  {yelpBusiness.phone && (
                    <>
                      <span className="text-stone-300">•</span>
                      <p>{yelpBusiness.phone}</p>
                    </>
                  )}
                </div>
              </div>
              {yelpBusiness.photos?.[0] && (
                <div className="h-16 w-16 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                  <Image 
                    src={yelpBusiness.photos[0]} 
                    alt={yelpBusiness.name}
                    className="object-cover"
                    width={64}
                    height={64}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < yelpBusiness.rating 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-stone-200"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">
                  {yelpBusiness.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-stone-300 mx-2">•</span>
              <p className="text-sm text-muted-foreground">
                {yelpBusiness.reviewCount.toLocaleString()} reviews on Yelp
              </p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reviews found
          </p>
        ) : (
          <>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="space-y-2 transition-all duration-200 hover:bg-accent/5 rounded-lg p-3 -mx-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {review.authorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{review.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.reviewDate), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <a
                      href={review.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View on Yelp
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground pl-11">
                    {review.text.length > 200 
                      ? `${review.text.slice(0, 200)}...` 
                      : review.text
                    }
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2 border-t">
              Due to Yelp API limitations, only the 3 most recent reviews can be displayed.
              View all reviews on your Yelp business page.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
} 