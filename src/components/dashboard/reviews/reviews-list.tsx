'use client'

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface Review {
  id: string
  authorName: string | null
  rating: number
  text: string
  reviewDate: string
  source: string
  isVerified: boolean
}

export function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const REVIEWS_PER_PAGE = 10

  async function fetchReviews(loadMore = false) {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/reviews?page=${page}&limit=${REVIEWS_PER_PAGE}`)
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const data = await res.json()
      
      if (loadMore) {
        setReviews(prev => [...prev, ...data.reviews])
      } else {
        setReviews(data.reviews)
      }
      
      setHasMore(data.reviews.length === REVIEWS_PER_PAGE)
      if (loadMore) setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleLoadMore = () => {
    fetchReviews(true)
  }

  if (isLoading && reviews.length === 0) {
    return <div className="text-sm text-stone-600">Loading reviews...</div>
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>
  }

  if (reviews.length === 0) {
    return <div className="text-sm text-stone-600">No reviews found.</div>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="p-4 bg-white rounded-lg border border-stone-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
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
                <p className="text-sm text-stone-600 mt-1">{review.text}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-stone-500">
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-stone-500">{review.source}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    review.isVerified 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {review.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full mt-4 py-2 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-50 border border-stone-200 rounded-lg hover:bg-stone-50"
        >
          {isLoading ? 'Loading...' : 'Load More Reviews'}
        </button>
      )}
    </div>
  )
}