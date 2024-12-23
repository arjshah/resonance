'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Mail, Calendar, Clock, LogOut } from "lucide-react"
import { format } from 'date-fns'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  phone: string | null
  role: string | null
  lastLoginAt: string | null
  createdAt: string
}

export function UserProfile() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Logout failed')
      
      // Fade out animation before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/user/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data = await response.json()
        setUserData(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoggingOut) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-stone-900" />
              <p className="text-stone-600">Signing out...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-stone-50 animate-pulse">
              <div className="h-6 bg-stone-200 rounded w-1/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-stone-200 rounded w-1/2" />
                <div className="h-4 bg-stone-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="rounded-lg border-2 border-red-100 bg-red-50/50 p-4">
            <div className="flex items-center gap-2 text-red-600">
              <User className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userData) return null

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-stone-600" />
            <CardTitle className="text-xl font-light">Profile Information</CardTitle>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </motion.div>
        </div>
        <CardDescription>
          Your personal account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            {userData.image && (
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-stone-100">
                <Image
                  src={userData.image}
                  alt={userData.name || ''}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium">{userData.name}</h3>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-stone-500" />
              <span className="text-muted-foreground">Email:</span>
              <span>{userData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-stone-500" />
              <span className="text-muted-foreground">Member Since:</span>
              <span>{format(new Date(userData.createdAt), 'MMMM d, yyyy')}</span>
            </div>
            {userData.lastLoginAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-stone-500" />
                <span className="text-muted-foreground">Last Login:</span>
                <span>{format(new Date(userData.lastLoginAt), 'MMMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 