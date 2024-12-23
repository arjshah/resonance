'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          setIsLoading(true)
          
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
          })

          const data = await res.json()
          
          if (!res.ok) throw new Error(data.error || 'Something went wrong')
          
          if (data.user) {
            setIsRedirecting(true)
            await new Promise(resolve => setTimeout(resolve, 500))
            window.location.href = '/dashboard'
          }
        } catch (error) {
          console.error('Error:', error)
          setIsLoading(false)
        }
      },
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 280,
      shape: 'pill',
    })
  }, [])

  return (
    <motion.div 
      className="min-h-screen w-full flex"
      initial={{ opacity: 1 }}
      animate={{ opacity: isRedirecting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Column - Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black items-center justify-center p-8">
        <div className="max-w-md">
          <h1 className="text-5xl font-light mb-4">Resonance</h1>
          <p className="text-xl text-muted-foreground">
            Transform customer feedback into actionable insights with our powerful review analysis platform
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-black">
        <div className="w-full max-w-sm">
          {/* Mobile Logo - Only shown on small screens */}
          <div className="mb-12 lg:hidden text-center">
            <h1 className="text-3xl font-light">Resonance</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customer reviews and insights platform
            </p>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="space-y-2 pb-8">
              <CardTitle className="text-2xl font-light">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div ref={buttonRef} className="flex justify-center" />
                {isLoading && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please wait while we sign you in...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground mt-12 text-center">
            By signing in, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors duration-200">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors duration-200">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  )
}