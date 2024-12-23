import { useState, useEffect } from 'react'

interface YelpBusiness {
  id: string
  name: string
  url: string
  rating: number
  reviewCount: number
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  lastSyncedAt?: string
  totalSyncedReviews?: number
}

interface YelpConnectionState {
  isConnected: boolean
  isLoading: boolean
  business: YelpBusiness | null
  error: string | null
  refreshConnection: () => Promise<void>
}

export function useYelpConnection(): YelpConnectionState {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [business, setBusiness] = useState<YelpBusiness | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function checkConnection() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/business/yelp/preview')
      
      if (!response.ok) {
        if (response.status === 404) {
          setIsConnected(false)
          return
        }
        throw new Error('Failed to check connection status')
      }

      const data = await response.json()
      setIsConnected(true)
      setBusiness({
        id: data.id,
        name: data.name,
        url: data.url,
        rating: data.rating,
        reviewCount: data.review_count,
        phone: data.phone,
        address: data.location.address1,
        city: data.location.city,
        state: data.location.state,
        zipCode: data.location.zip_code,
        lastSyncedAt: data.lastSyncedAt,
        totalSyncedReviews: data.totalSyncedReviews
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return {
    isConnected,
    isLoading,
    business,
    error,
    refreshConnection: checkConnection
  }
}
