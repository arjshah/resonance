// app/business/page.tsx
'use client'

import { BusinessProfile } from "@/components/dashboard/business/business-profile"
import { PageTransition } from "@/components/layout/page-transition"

export default function BusinessPage() {
  return (
    <PageTransition className="min-h-screen">
      <BusinessProfile />
    </PageTransition>
  )
}