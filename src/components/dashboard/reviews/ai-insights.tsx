'use client'

import { useEffect, useState } from "react"
import { ArrowUp, TrendingUp, Star, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Match the API response type
interface AIAnalysis {
  summary: {
    text: string
    sentiment: "positive" | "neutral" | "negative"
  }
  rating: {
    current: number
    previous: number
    trend: "up" | "down" | "stable"
  }
  topics: Array<{
    name: string
    sentiment: "positive" | "neutral" | "negative"
    frequency: number
    examples: string[]
  }>
  improvements: Array<{
    area: string
    description: string
    priority: "high" | "medium" | "low"
  }>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Skeleton */}
      <div className="p-4 bg-blue-50/50 rounded-lg">
        <Skeleton className="h-4 w-3/4 bg-blue-100" />
        <Skeleton className="h-4 w-2/3 mt-2 bg-blue-100" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-stone-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24 bg-stone-200" />
              <Skeleton className="h-4 w-4 rounded-full bg-stone-200" />
            </div>
            <div className="flex items-baseline space-x-2">
              <Skeleton className="h-8 w-16 bg-stone-200" />
              <Skeleton className="h-4 w-12 bg-stone-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Topics Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32 bg-stone-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-stone-50 rounded-lg">
            <Skeleton className="h-4 w-40 bg-stone-200" />
            <Skeleton className="h-3 w-24 mt-1 bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AIInsights() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/reviews/analyze')
        if (!res.ok) throw new Error('Failed to fetch analysis')
        const data = await res.json()
        setAnalysis(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching analysis:', error)
        setError('Failed to load insights')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !analysis) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error || 'No insights available'}</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-red-600 hover:text-red-700 mt-2 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Combined Summary and Rating Card */}
      <div className="p-6 bg-white rounded-lg border border-stone-100">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Summary Section */}
          <div className="flex-1">
            <div className={`p-4 rounded-lg ${
              analysis.summary.sentiment === "positive" ? "bg-emerald-50/50 text-emerald-700" :
              analysis.summary.sentiment === "negative" ? "bg-red-50/50 text-red-700" :
              "bg-blue-50/50 text-blue-700"
            }`}>
              <h3 className="text-sm font-medium mb-2">Summary</h3>
              <p className="text-sm leading-relaxed">{analysis.summary.text}</p>
            </div>
          </div>

          {/* Rating Section */}
          <div className="md:w-64 flex-shrink-0">
            <div className="p-4 bg-stone-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-stone-600">Average Rating</h3>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-light">{analysis.rating.current.toFixed(1)}</span>
                {analysis.rating.previous > 0 && analysis.rating.trend !== 'stable' && (
                  <span className={`text-sm flex items-center ${
                    analysis.rating.trend === "up" ? "text-emerald-600" :
                    analysis.rating.trend === "down" ? "text-red-600" :
                    "text-stone-600"
                  }`}>
                    {analysis.rating.trend === "up" && <ArrowUp className="h-3 w-3 mr-0.5" />}
                    {Math.abs(analysis.rating.current - analysis.rating.previous) > 0 
                      ? (analysis.rating.current - analysis.rating.previous).toFixed(1) 
                      : null}
                  </span>
                )}
              </div>
              {analysis.rating.previous > 0 && Math.abs(analysis.rating.current - analysis.rating.previous) > 0 && (
                <p className="text-xs text-stone-500 mt-1">
                  vs. previous {analysis.rating.previous.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Areas to Improve Card */}
      <div className="p-4 bg-stone-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-stone-600">Areas to Improve</h3>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
        <div className="space-y-2">
          {analysis.improvements.map((improvement, index) => (
            <div key={index} className="border-l-2 pl-2 text-sm" style={{
              borderColor: improvement.priority === "high" ? "#ef4444" : 
                          improvement.priority === "medium" ? "#f59e0b" : 
                          "#84cc16"
            }}>
              <p className="font-medium text-stone-700">{improvement.area}</p>
              <p className="text-xs text-stone-500 line-clamp-2">{improvement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Key Topics Section */}
      <div>
        <h3 className="text-sm font-medium text-stone-600 mb-4">Key Topics Mentioned</h3>
        <div className="space-y-3">
          {analysis.topics.map((topic, index) => (
            <div key={index} className="p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-stone-700">{topic.name}</h4>
                  <p className="text-xs text-stone-500">Mentioned in {topic.frequency}% of reviews</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  topic.sentiment === "positive" ? "bg-emerald-50 text-emerald-600" :
                  topic.sentiment === "negative" ? "bg-red-50 text-red-600" :
                  "bg-stone-100 text-stone-600"
                }`}>
                  {topic.sentiment}
                </span>
              </div>
              {topic.examples.length > 0 && (
                <div className="mt-2 text-xs text-stone-600">
                  <p className="italic">"{topic.examples[0]}"</p>
                  {topic.examples.length > 1 && (
                    <p className="text-stone-500 mt-1">
                      +{topic.examples.length - 1} more example{topic.examples.length > 2 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}