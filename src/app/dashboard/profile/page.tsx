'use client'

import { UserProfile } from "@/components/dashboard/user/user-profile"
import { PageTransition } from "@/components/layout/page-transition"

export default function ProfilePage() {
  return (
    <PageTransition className="min-h-screen">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-light">User Profile</h1>
          <p className="text-sm text-muted-foreground">
            Your account information and settings
          </p>
        </div>

        <div className="grid gap-6">
          <UserProfile />
        </div>
      </div>
    </PageTransition>
  )
}