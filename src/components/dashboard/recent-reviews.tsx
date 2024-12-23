'use client'

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: string
  authorName: string | null
  rating: number
  text: string
  reviewDate: string
  source: string
  isVerified: boolean
}

function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="pl-12">
        <Skeleton className="h-4 w-[90%] mb-2" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="pl-12">
        <div className="border-t border-gray-100 dark:border-gray-800" />
      </div>
    </div>
  )
}

export function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/reviews?limit=3')
        if (!res.ok) throw new Error('Failed to fetch reviews')
        const data = await res.json()
        setReviews(data.reviews)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setError('Failed to load reviews')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 text-center py-8">
        {error}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No reviews found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-8 w-8 bg-blue-50">
                <AvatarFallback className="bg-blue-50 text-blue-600">
                  {review.authorName?.split(' ').map(n => n[0]).join('') ?? '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{review.authorName ?? 'Anonymous'}</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(review.reviewDate), { addSuffix: true })}
                </p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              review.isVerified 
                ? "bg-emerald-50 text-emerald-600" 
                : "bg-amber-50 text-amber-600"
            }`}>
              {review.source}
            </span>
          </div>

          <div className="pl-12">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {review.text}
            </p>
          </div>

          {reviews[reviews.length - 1].id !== review.id && (
            <div className="pl-12">
              <div className="border-t border-gray-100 dark:border-gray-800" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}