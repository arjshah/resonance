'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircle, 
  RefreshCcw, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Star,
  ArrowUpRight
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useYelpConnection } from "@/hooks/use-yelp-connection"
import { cn } from "@/lib/utils"

interface SyncStats {
  totalReviews: number
  syncedReviews: number
  lastSyncedAt: string | null
}

interface SyncRecord {
  id: string
  timestamp: string
  status: 'success' | 'failure'
  reviewsSynced: number
  duration: number
  error?: string
}

export function YelpSyncCard() {
  const { business } = useYelpConnection()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncRecord[]>([])
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalReviews: business?.yelpReviewCount || 0,
    syncedReviews: 0,
    lastSyncedAt: business?.lastYelpSync || null
  })

  async function fetchSyncStats(showLoading = true) {
    try {
      if (showLoading) {
        setIsLoading(true)
      }
      setError(null)
      
      const [statsResponse, historyResponse] = await Promise.all([
        fetch('/api/business/yelp/sync/stats'),
        fetch('/api/business/yelp/sync/history')
      ])

      if (!statsResponse.ok) {
        const data = await statsResponse.json()
        throw new Error(data.error || 'Failed to fetch sync stats')
      }
      
      const statsData = await statsResponse.json()
      const historyData = await historyResponse.json()

      // Use a slight delay to make the transition smoother
      await new Promise(resolve => setTimeout(resolve, 300))

      setSyncStats({
        totalReviews: statsData.totalReviews,
        syncedReviews: statsData.syncedCount,
        lastSyncedAt: statsData.lastSyncedAt
      })
      setSyncHistory(historyData.history.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sync stats')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSyncStats()
  }, [business?.yelpReviewCount])

  async function handleSync() {
    try {
      setIsSyncing(true)
      setError(null)

      const response = await fetch('/api/business/yelp/sync', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(`Rate limit reached: ${data.details || 'Please try again later'}`)
        }
        throw new Error(data.details || 'Failed to sync reviews')
      }

      // Refresh stats without showing loading state
      await fetchSyncStats(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync reviews')
      // Update the temporary record to show failure
      setSyncHistory(prev => [{
        ...prev[0],
        status: 'failure',
        error: err instanceof Error ? err.message : 'Sync failed'
      }, ...prev.slice(1)])
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="transition-opacity duration-200">
        <CardHeader>
          <CardTitle className="text-xl font-light">Review Sync Status</CardTitle>
          <CardDescription>Loading sync status...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Fetching latest sync data...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-xl font-light">Review Sync Status</CardTitle>
        <CardDescription>
          Manage review synchronization with Yelp (limited to 3 most recent reviews)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid with transition */}
        <div className="grid grid-cols-2 gap-4 transition-all duration-200">
          <div className="rounded-lg border bg-card p-4 transition-all duration-200 hover:bg-accent/5">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Total Reviews</p>
            </div>
            <p className="mt-2 text-2xl font-semibold">{syncStats.totalReviews}</p>
            <p className="text-xs text-muted-foreground mt-1">On Yelp</p>
          </div>
          <div className="rounded-lg border bg-card p-4 transition-all duration-200 hover:bg-accent/5">
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Synced Reviews</p>
            </div>
            <p className="mt-2 text-2xl font-semibold">{syncStats.syncedReviews}</p>
            <p className="text-xs text-muted-foreground mt-1">Via API</p>
          </div>
        </div>

        {/* Last Sync Status with transition */}
        <div className="rounded-lg border bg-card p-4 transition-all duration-200 hover:bg-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {syncStats.lastSyncedAt 
                  ? `Last synced ${formatDistanceToNow(new Date(syncStats.lastSyncedAt), { addSuffix: true })}` 
                  : 'Never synced'
                }
              </span>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              size="sm"
            >
              <RefreshCcw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {/* Error Message with fade */}
        {error && (
          <Alert 
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sync History with transitions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Syncs</h3>
          
          <div className="space-y-2">
            {syncHistory.map((record, index) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-start justify-between rounded-lg border bg-card p-3 transition-all duration-200",
                  "hover:bg-accent/5",
                  record.id.startsWith('temp-') && "animate-pulse"
                )}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-start gap-3">
                  {record.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {record.status === 'success' 
                        ? `Synced ${record.reviewsSynced} reviews` 
                        : 'Sync failed'
                      }
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(record.timestamp), 'MMM d, h:mm a')}</span>
                      <span>•</span>
                      <span>{record.duration}ms</span>
                    </div>

                    {record.error && (
                      <p className="text-xs text-red-500">
                        {record.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Due to Yelp API limitations, only the 3 most recent reviews can be synced. 
          Reviews are automatically synced daily.
        </p>
      </CardContent>
    </Card>
  )
} 