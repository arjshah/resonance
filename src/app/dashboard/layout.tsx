import { TopNav } from "@/components/dashboard/top-nav"
import { SideNav } from "@/components/dashboard/side-nav"
import { PageTransition } from "@/components/layout/page-transition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-950">
      <TopNav />
      <div className="flex h-[calc(100vh-4rem)]">
        <SideNav />
        <main className="flex-1 overflow-y-auto">
          <PageTransition className="container max-w-7xl mx-auto py-8 px-6">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}