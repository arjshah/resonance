'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  MessageSquare,
  Settings,
  Store,
  Users,
  ChevronLeft,
  ChevronRight,
  Brain,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: 'Overview',
    icon: BarChart3,
    href: '/dashboard',
    color: "text-amber-700",
  },
  {
    label: 'AI Insights',
    icon: Brain,
    href: '/dashboard/reviews',
    color: "text-stone-700",
  },
  {
    label: 'Customers',
    icon: Users,
    color: "text-sage-700",
    href: '/dashboard/customers',
  },
  {
    label: 'Yelp',
    icon: Store,
    color: "text-yellow-600",
    href: '/dashboard/yelp',
  },
  {
    label: 'Business',
    icon: Store,
    color: "text-emerald-700",
    href: '/dashboard/business',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
    color: "text-stone-600",
  },
]

export function SideNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-stone-50 dark:bg-stone-950 transition-[width] duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <div className="px-3 py-6 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center p-3 w-full rounded-lg transition-all duration-200",
                isCollapsed ? "justify-center" : "justify-start",
                pathname === route.href
                  ? "bg-stone-100 dark:bg-stone-900"
                  : "hover:bg-stone-100/50 dark:hover:bg-stone-900/50",
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium text-stone-600 dark:text-stone-400">
                  {route.label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}