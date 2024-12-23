'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface VerificationStep {
  title: string
  status: 'idle' | 'loading' | 'success' | 'error'
  description?: string
  helpText?: string
}

export function YelpConnectionFlow() {
  const [businessUrl, setBusinessUrl] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      title: "Yelp Authentication",
      status: 'idle',
      description: 'Verify your Yelp business ownership'
    },
    {
      title: "Business Import",
      status: 'idle',
      description: 'Import your business details'
    },
    {
      title: "Review Sync Setup",
      status: 'idle',
      description: 'Configure review synchronization'
    }
  ])

  async function handleConnect() {
    try {
      setIsVerifying(true)
      setError(null)

      // Step 1: Verify Business
      setVerificationSteps(steps => steps.map(step => 
        step.title === "Yelp Authentication" 
          ? { ...step, status: 'loading', description: 'Verifying business ownership...' }
          : step
      ))

      const verifyResponse = await fetch('/api/business/yelp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessUrl })
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.message || 'Verification failed')
      }

      const verifyData = await verifyResponse.json()

      setVerificationSteps(steps => steps.map(step => 
        step.title === "Yelp Authentication" 
          ? { 
              ...step, 
              status: 'success',
              description: 'Business verified successfully'
            }
          : step
      ))

      // Step 2: Import Business
      setVerificationSteps(steps => steps.map(step => 
        step.title === "Business Import" 
          ? { ...step, status: 'loading', description: 'Importing business details...' }
          : step
      ))

      const importResponse = await fetch('/api/business/yelp/import', {
        method: 'POST'
      })

      if (!importResponse.ok) {
        throw new Error('Failed to import business details')
      }

      setVerificationSteps(steps => steps.map(step => 
        step.title === "Business Import" 
          ? { 
              ...step, 
              status: 'success',
              description: 'Business details imported successfully'
            }
          : step
      ))

      // Step 3: Setup Review Sync
      setVerificationSteps(steps => steps.map(step => 
        step.title === "Review Sync Setup" 
          ? { 
              ...step, 
              status: 'loading',
              description: 'Setting up review synchronization...'
            }
          : step
      ))

      const syncResponse = await fetch('/api/business/yelp/sync', {
        method: 'POST'
      })

      if (!syncResponse.ok) {
        throw new Error('Failed to setup review sync')
      }

      const syncData = await syncResponse.json()

      setVerificationSteps(steps => steps.map(step => 
        step.title === "Review Sync Setup" 
          ? { 
              ...step, 
              status: 'success',
              description: `Synced ${syncData.metrics.syncedReviews} reviews`,
              helpText: 'Reviews will update daily'
            }
          : step
      ))

      // Refresh the page after successful connection
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setVerificationSteps(steps => steps.map(step => 
        step.status === 'loading'
          ? { ...step, status: 'error' }
          : step
      ))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-light">Connect Your Yelp Business</CardTitle>
        <CardDescription>
          Enter your Yelp business page URL to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.yelp.com/biz/your-business"
              value={businessUrl}
              onChange={(e) => setBusinessUrl(e.target.value)}
              disabled={isVerifying}
              className="flex-1"
            />
            <Button 
              onClick={handleConnect}
              disabled={!businessUrl || isVerifying}
            >
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This should be the URL of your business page on Yelp
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Verification Steps */}
        <div className="space-y-4">
          {verificationSteps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="mt-0.5">
                {step.status === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {step.status === 'loading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {step.status === 'idle' && (
                  <div className="h-5 w-5 rounded-full border-2 border-stone-200" />
                )}
              </div>
              
              {/* Step Details */}
              <div className="space-y-1">
                <h3 className="font-medium leading-none">{step.title}</h3>
                {step.description && (
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                )}
                {step.helpText && (
                  <p className="text-sm text-muted-foreground">
                    {step.helpText}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 