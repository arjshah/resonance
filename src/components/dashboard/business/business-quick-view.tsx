import { Building2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

interface BusinessInfo {
  name: string | null
  city: string | null
  state: string | null
  industry: string | null
}

function BusinessQuickViewSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-white to-stone-50 w-full md:col-span-3">
      <div className="p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

export function BusinessQuickView({ className }: { className?: string }) {
  const [business, setBusiness] = useState<BusinessInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBusinessInfo() {
      try {
        const response = await fetch('/api/business/info')
        if (!response.ok) throw new Error('Failed to fetch business info')
        const data = await response.json()
        setBusiness(data)
      } catch (error) {
        console.error('Error fetching business info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessInfo()
  }, [])

  if (isLoading) {
    return <BusinessQuickViewSkeleton />
  }

  if (!business?.name) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-gradient-to-br from-white to-stone-50",
        "hover:shadow-sm transition-all duration-200 w-full md:col-span-3",
        className
      )}
    >
      <div className="p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-stone-100/80 p-2">
            <Building2 className="h-4 w-4 text-stone-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-stone-800 truncate">
              {business.name}
            </h2>
            <p className="text-xs text-stone-500 truncate">
              {[business.city, business.state].filter(Boolean).join(", ")}
              {business.industry && ` • ${business.industry}`}
            </p>
          </div>
        </div>
        
        <Link 
          href="/dashboard/business"
          className="text-xs text-stone-500 hover:text-stone-800 transition-colors duration-200 flex items-center gap-0.5"
        >
          Edit Profile
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  )
} 