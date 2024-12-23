'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function ConnectionStatus() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [showNoBusinessDialog, setShowNoBusinessDialog] = useState(false)
  const [showQuotaExceededDialog, setShowQuotaExceededDialog] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    
    try {
      const auth2 = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'https://www.googleapis.com/auth/business.manage',
        ux_mode: 'popup',
        callback: async (response) => {
          if (response.code) {
            try {
              const res = await fetch('/api/business/google/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: response.code })
              })

              const data = await res.json()

              if (!res.ok) {
                if (data.error === 'NO_BUSINESS_PROFILE') {
                  setShowNoBusinessDialog(true)
                } else if (data.error === 'API_QUOTA_EXCEEDED') {
                  setShowQuotaExceededDialog(true)
                } else {
                  toast.error(data.error || 'Failed to connect business')
                }
                return
              }

              setIsConnected(true)
              toast.success('Successfully connected Google Business Profile!')
            } catch (error) {
              console.error('Error:', error)
              toast.error('Failed to connect business. Please try again.')
            } finally {
              setIsConnecting(false)
            }
          }
        },
      })

      auth2.requestCode()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to initiate Google sign-in. Please try again.')
      setIsConnecting(false)
    }
  }

  return (
    <>
      <div className="p-6 rounded-lg bg-stone-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-stone-600" />
              <h2 className="text-xl font-light">Google Business Profile</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? "Connected and syncing business information" 
                : "Connect your Google Business Profile to import your business information"}
            </p>
          </div>
          
          <Button 
            variant={isConnected ? "outline" : "default"}
            className="space-x-2"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <span>
              {isConnecting 
                ? "Connecting..." 
                : isConnected 
                  ? "Manage Connection" 
                  : "Connect Google"
              }
            </span>
          </Button>
        </div>
      </div>

      <Dialog open={showNoBusinessDialog} onOpenChange={setShowNoBusinessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Business Profile Found</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4">
                <div>
                  We couldn't find a Google Business Profile associated with your account. 
                  To connect your business, you'll need to:
                </div>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Visit <a 
                    href="https://business.google.com/create" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google Business Profile
                  </a>
                  </li>
                  <li>Click "Get Started"</li>
                  <li>Follow the steps to create your business profile</li>
                  <li>Return here and try connecting again</li>
                </ol>
                <div className="text-sm text-muted-foreground">
                  Note: It may take a few minutes for your new business profile to become available after creation.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuotaExceededDialog} onOpenChange={setShowQuotaExceededDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection Limit Reached</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4">
                <div>
                  We've hit Google's API rate limit. This can happen when:
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li>Too many connection attempts in a short time</li>
                  <li>The API quota has been reached for the day</li>
                </ul>
                <div>
                  Please wait a few minutes and try again. If the problem persists:
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li>Make sure you're signed into the correct Google account</li>
                  <li>Verify your business profile is fully set up at{' '}
                    <a 
                      href="https://business.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Business Profile
                    </a>
                  </li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
} 