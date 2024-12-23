'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Store, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Star,
  RefreshCcw,
  Power
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VerificationStep {
  title: string
  description: string
  status: 'pending' | 'success' | 'error' | 'loading'
  message?: string
  helpText?: string
  details?: string
}

interface ConnectionProgress {
  currentStep: number
  totalSteps: number
  reviewCount?: number
}

interface YelpPreview {
  totalReviews: number
  rating: number
  reviewSample?: {
    text: string
    rating: number
    author: string
    date: string
  }
}

interface SyncState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  metrics?: {
    total: number;
    synced: number;
  };
}

interface ErrorState {
  code?: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    url?: string;
    handler?: () => void;
  };
}

// Add these animation variants for consistent motion
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 }
}

const slideIn = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.2 }
}

export function YelpConnectionStatus() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [connectionProgress, setConnectionProgress] = useState<ConnectionProgress>({
    currentStep: 0,
    totalSteps: 3
  })
  const [yelpPreview, setYelpPreview] = useState<YelpPreview | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle'
  })
  const [error, setError] = useState<ErrorState | null>(null)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      title: "Yelp Authentication",
      description: "Verifying your Yelp Business Account",
      status: "pending",
      helpText: "We'll check if your business is registered on Yelp"
    },
    {
      title: "Business Import",
      description: "Importing your business information",
      status: "pending",
      helpText: "We'll sync your business details from Yelp"
    },
    {
      title: "Review Sync Setup",
      description: "Setting up automatic review syncing",
      status: "pending",
      helpText: "This will keep your reviews up to date"
    }
  ])

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch('/api/business')
        const data = await response.json()
        
        if (data.business?.yelpId) {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking Yelp connection:', error)
      } finally {
        setIsInitializing(false)
      }
    }
    checkConnection()
  }, [])

  const fetchYelpPreview = async () => {
    try {
      const response = await fetch('/api/business/yelp/preview')
      const data = await response.json()
      if (response.ok) {
        setYelpPreview(data)
      }
    } catch (error) {
      console.error('Error fetching Yelp preview:', error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionProgress({ currentStep: 1, totalSteps: 3 })
    
    try {
      // Step 1: Verify API Connection
      setVerificationSteps(steps => steps.map(step => 
        step.title === "Yelp Authentication" 
          ? { ...step, status: 'loading' }
          : step
      ))

      const authResponse = await fetch('/api/business/yelp/auth')
      const authData = await authResponse.json()

      if (!authResponse.ok) {
        setVerificationSteps(steps => steps.map(step => 
          step.title === "Yelp Authentication" 
            ? { 
                ...step, 
                status: 'error',
                message: authData.error || 'Connection failed',
                helpText: authData.location 
                  ? `We tried searching in ${authData.location}. Please make sure your business is registered on Yelp in this area.`
                  : 'Please make sure your business is registered on Yelp',
                description: 'Unable to verify your Yelp Business Account',
                details: authData.details
              }
            : step
        ))
        return
      }

      setVerificationSteps(steps => steps.map(step => 
        step.title === "Yelp Authentication" 
          ? { 
              ...step, 
              status: 'success',
              description: 'Successfully connected to Yelp',
              helpText: authData.location 
                ? `Verified Yelp API access for ${authData.location}`
                : undefined
            }
          : step
      ))

      // Step 2: Import Business
      setConnectionProgress(prev => ({ ...prev, currentStep: 2 }))
      setVerificationSteps(steps => steps.map(step => 
        step.title === "Business Import" 
          ? { ...step, status: 'loading' }
          : step
      ))

      const importResponse = await fetch('/api/business/yelp/import', {
        method: 'POST'
      })

      const importData = await importResponse.json()

      if (!importResponse.ok) {
        setVerificationSteps(steps => steps.map(step => 
          step.title === "Business Import" 
            ? { 
                ...step, 
                status: 'error',
                message: importData.error || 'Import failed',
                helpText: importData.details || 'Please verify your business information on Yelp',
                description: 'Unable to import business details'
              }
            : step
        ))
        return
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
      setConnectionProgress(prev => ({ ...prev, currentStep: 3 }))
      setVerificationSteps(steps => steps.map(step => 
        step.title === "Review Sync Setup" 
          ? { 
              ...step, 
              status: 'loading',
              description: 'Fetching reviews from Yelp',
              helpText: 'This might take a moment...'
            }
          : step
      ))

      const syncResponse = await fetch('/api/business/yelp/sync', {
        method: 'POST'
      })

      if (!syncResponse.ok) {
        throw new Error(await syncResponse.text())
      }

      const syncData = await syncResponse.json()
      
      setConnectionProgress(prev => ({ 
        ...prev, 
        currentStep: 3,
        reviewCount: syncData.metrics.syncedReviews 
      }))

      // Update verification steps with success
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

      setIsConnected(true)
      setTimeout(() => {
        setShowConnectDialog(false)
        router.refresh()
      }, 2000)

    } catch (error) {
      console.error('Sync error:', error)
      setVerificationSteps(steps => steps.map(step => 
        step.status === 'loading'
          ? { 
              ...step, 
              status: 'error',
              message: error.message || 'Sync failed',
              helpText: 'Please try again'
            }
          : step
      ))
      setIsConnecting(false)
    }
  }

  const handleOpenDialog = () => {
    setShowConnectDialog(true)
    if (!isConnected) {
      fetchYelpPreview()
    }
  }

  const handleSync = async () => {
    try {
      setSyncState({
        status: 'loading',
        message: 'Syncing your Yelp reviews...'
      })
      setError(null)
      setIsSyncing(true)
      
      const syncResponse = await fetch('/api/business/yelp/sync', {
        method: 'POST'
      })

      const responseText = await syncResponse.text()
      let syncData
      try {
        syncData = JSON.parse(responseText)
      } catch (e) {
        throw new Error('SERVER_ERROR')
      }

      if (!syncResponse.ok) {
        // Handle specific error cases
        switch (syncData.code) {
          case 'YELP_API_ERROR':
            throw new Error('YELP_CONNECTION')
          case 'RATE_LIMIT':
            throw new Error('RATE_LIMIT')
          case 'AUTH_ERROR':
            throw new Error('AUTH_ERROR')
          default:
            throw new Error('UNKNOWN_ERROR')
        }
      }

      if (syncData.success) {
        setSyncState({
          status: 'success',
          message: `Successfully synced ${syncData.metrics.syncedReviews} reviews`,
          metrics: {
            total: syncData.metrics.totalReviews,
            synced: syncData.metrics.syncedReviews
          }
        })
      } else {
        throw new Error('SYNC_FAILED')
      }
    } catch (error) {
      const errorMessages: Record<string, ErrorState> = {
        YELP_CONNECTION: {
          message: 'Unable to connect to Yelp',
          details: 'We\'re having trouble connecting to Yelp\'s servers. This might be temporary.',
          action: {
            label: 'Try again',
            handler: handleSync
          }
        },
        RATE_LIMIT: {
          message: 'Too many requests',
          details: 'We\'ve hit Yelp\'s rate limit. Please wait a few minutes before trying again.',
          action: {
            label: 'Learn more',
            url: 'https://docs.developer.yelp.com/docs/rate-limiting'
          }
        },
        AUTH_ERROR: {
          message: 'Authentication error',
          details: 'Your Yelp connection needs to be refreshed.',
          action: {
            label: 'Reconnect',
            handler: handleConnect
          }
        },
        SERVER_ERROR: {
          message: 'Server error',
          details: 'Something went wrong on our end. We\'ve been notified and are looking into it.',
          action: {
            label: 'Try again',
            handler: handleSync
          }
        },
        SYNC_FAILED: {
          message: 'Sync failed',
          details: 'Unable to sync reviews. Please try again.',
          action: {
            label: 'Try again',
            handler: handleSync
          }
        },
        UNKNOWN_ERROR: {
          message: 'Something went wrong',
          details: 'An unexpected error occurred. Please try again.',
          action: {
            label: 'Try again',
            handler: handleSync
          }
        }
      }

      const errorState = errorMessages[error.message] || errorMessages.UNKNOWN_ERROR
      setError(errorState)
      setSyncState({
        status: 'error',
        message: errorState.message
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)
      
      const response = await fetch('/api/business/yelp/disconnect', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect')
      }

      // Update local state
      setIsConnected(false)
      setShowConnectDialog(false)
      router.refresh()
      
    } catch (error) {
      setError({
        message: 'Failed to disconnect',
        details: 'There was a problem disconnecting your Yelp account. Please try again.',
        action: {
          label: 'Try again',
          handler: handleDisconnect
        }
      })
    } finally {
      setIsDisconnecting(false)
      setShowDisconnectDialog(false)
    }
  }

  const DisconnectAlert = () => (
    <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect Yelp Account?</AlertDialogTitle>
          <div className="space-y-2">
            <AlertDialogDescription>
              This will stop syncing reviews from your Yelp Business account. 
              Your existing synced reviews will remain in the system.
            </AlertDialogDescription>
            <AlertDialogDescription>
              You can reconnect your account at any time.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDisconnecting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDisconnect()
            }}
            disabled={isDisconnecting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  if (isInitializing) {
    return (
      <div className="p-6 rounded-lg bg-stone-50">
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-stone-600" />
          <span className="ml-2 text-sm text-stone-600">
            Checking connection status...
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6 rounded-lg bg-stone-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5 text-stone-600" />
              <h2 className="text-xl font-light">Yelp Business</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? "Connected and syncing reviews from Yelp" 
                : "Connect your Yelp Business Account to import reviews"}
            </p>
          </div>
          
          <Button 
            variant={isConnected ? "outline" : "default"}
            onClick={handleOpenDialog}
            disabled={isConnecting}
            className={cn(
              "min-w-[140px] transition-all duration-200",
              isConnected 
                ? "hover:bg-stone-100 hover:border-stone-300" 
                : "hover:scale-105"
            )}
          >
            <motion.div
              className="flex items-center gap-2"
              initial={false}
              animate={{ 
                scale: isConnecting ? 0.95 : 1,
                opacity: isConnecting ? 0.9 : 1
              }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {connectionProgress.currentStep === 3 && connectionProgress.reviewCount
                      ? `Syncing ${connectionProgress.reviewCount} Reviews...`
                      : `Step ${connectionProgress.currentStep}/${connectionProgress.totalSteps}`
                    }
                  </span>
                </>
              ) : (
                <>
                  {isConnected ? (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      <span>Manage Connection</span>
                    </>
                  ) : (
                    <>
                      <Store className="h-4 w-4" />
                      <span>Connect Yelp</span>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </Button>
        </div>
      </div>

      <Dialog 
        open={showConnectDialog} 
        onOpenChange={(open) => {
          if (!isConnecting) {
            setShowConnectDialog(open)
            setConnectionProgress({ currentStep: 0, totalSteps: 3 })
            if (open) {
              fetchYelpPreview()
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isConnected ? 'Yelp Reviews Sync' : 'Connect Your Yelp Business'}
            </DialogTitle>
            <DialogDescription>
              {isConnected 
                ? 'Manage your Yelp reviews synchronization'
                : 'Connect your Yelp Business Account to automatically import and sync your reviews'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Connected State */}
            {isConnected ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Connection Status Card */}
                <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-emerald-900">Connected to Yelp</h3>
                        <p className="text-sm text-emerald-700">
                          Last synced: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowDisconnectDialog(true)}
                      disabled={isDisconnecting}
                    >
                      {isDisconnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Sync Stats */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-sm font-medium text-stone-900 mb-4">Review Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-50 rounded-lg p-4">
                      <div className="text-sm text-stone-600">Total Reviews</div>
                      <div className="text-2xl font-semibold text-stone-900">
                        {syncState.metrics?.total || 0}
                      </div>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-4">
                      <div className="text-sm text-stone-600">Synced Reviews</div>
                      <div className="text-2xl font-semibold text-stone-900">
                        {syncState.metrics?.synced || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sync Controls */}
                <div className="bg-stone-50 rounded-lg border border-stone-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-stone-900">Manual Sync</h3>
                      <p className="text-sm text-stone-600">Pull latest reviews from Yelp</p>
                    </div>
                    <Button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="min-w-[120px]"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Sync Now
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Show sync progress only when syncing */}
                  <AnimatePresence>
                    {isSyncing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-600">Sync Progress</span>
                            <span className="font-medium">
                              {Math.round((syncState.metrics?.synced || 0) / (syncState.metrics?.total || 1) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(syncState.metrics?.synced || 0) / (syncState.metrics?.total || 1) * 100}%` 
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && <ErrorDisplay error={error} />}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Initial Connection Flow */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Preview Section */}
                <AnimatePresence>
                  {yelpPreview && !isConnecting && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mb-6"
                    >
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Store className="h-5 w-5 text-yellow-600" />
                            <h3 className="text-sm font-medium text-yellow-900">
                              Available on Yelp
                            </h3>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < yelpPreview.rating 
                                      ? "text-yellow-400 fill-yellow-400" 
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-yellow-900">
                              {yelpPreview.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-2xl font-semibold text-yellow-900">
                              {yelpPreview.totalReviews}
                            </p>
                            <p className="text-sm text-yellow-700">
                              Reviews ready to sync
                            </p>
                          </div>

                          {yelpPreview.reviewSample && (
                            <div className="flex-1 ml-6">
                              <div className="bg-white/80 rounded-lg p-3 border border-yellow-100">
                                <div className="flex items-center space-x-1.5 mb-1">
                                  {[...Array(yelpPreview.reviewSample.rating)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="h-3 w-3 text-yellow-400 fill-yellow-400"
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-yellow-900 line-clamp-2">
                                  "{yelpPreview.reviewSample.text}"
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                  {yelpPreview.reviewSample.author} • {yelpPreview.reviewSample.date}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connection Steps */}
                <div className="bg-stone-50 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-stone-700 mb-6">
                    Connection Steps
                  </h3>
                  <div className="space-y-6">
                    {verificationSteps.map((step, index) => (
                      <VerificationStep 
                        key={step.title} 
                        step={step} 
                        index={index}
                        totalSteps={verificationSteps.length}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowConnectDialog(false)
                setConnectionProgress({ currentStep: 0, totalSteps: 3 })
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DisconnectAlert />
    </>
  )
}

function VerificationStep({ 
  step, 
  index,
  totalSteps 
}: { 
  step: VerificationStep
  index: number
  totalSteps: number 
}) {
  const icons = {
    pending: <AlertCircle className="h-5 w-5 text-stone-400" />,
    loading: <Loader2 className="h-5 w-5 animate-spin text-stone-400" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <motion.div 
      className="relative"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {index < totalSteps - 1 && (
        <div 
          className={cn(
            "absolute left-6 top-14 h-[calc(100%+24px)] w-0.5 -z-10",
            step.status === 'success' ? "bg-emerald-200" : "bg-stone-200"
          )} 
        />
      )}

      <motion.div 
        className="flex items-start gap-4 group"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="relative shrink-0"
          initial={false}
          animate={{ 
            scale: step.status === 'loading' ? 1.05 : 1,
            rotate: step.status === 'success' ? 360 : 0
          }}
          transition={{ duration: 0.4 }}
        >
          <div 
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white",
              step.status === 'success' 
                ? "border-emerald-500 text-emerald-600" 
                : step.status === 'error'
                  ? "border-red-500 text-red-600"
                  : "border-stone-200 text-stone-600"
            )}
          >
            <span className="text-sm font-medium">{index + 1}</span>
          </div>
          <div 
            className={cn(
              "absolute top-0 left-0 w-12 h-12 rounded-full flex items-center justify-center",
              step.status === 'loading' && "animate-ping opacity-20 bg-stone-400"
            )}
          />
        </motion.div>

        <motion.div 
          className="flex-1 min-w-0 pt-1"
          variants={slideIn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div 
            className={cn(
              "p-4 rounded-lg border-2 bg-white transition-colors",
              step.status === 'success' 
                ? "border-emerald-100 bg-emerald-50/50" 
                : step.status === 'error'
                  ? "border-red-100 bg-red-50/50"
                  : "border-stone-200"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className={cn(
                "text-sm font-medium",
                step.status === 'success' && "text-emerald-600",
                step.status === 'error' && "text-red-600"
              )}>
                {step.title}
              </h4>
              <div className="shrink-0">
                {icons[step.status]}
              </div>
            </div>
            <p className="text-sm text-stone-600">
              {step.message || step.description}
            </p>
            {(step.status === 'error' && step.helpText) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2"
              >
                <p className="text-sm text-red-600">
                  {step.helpText}
                </p>
                {step.title === "Yelp Authentication" && (
                  <a
                    href="https://biz.yelp.com/claim"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    <span>Claim your business on Yelp</span>
                    <span>→</span>
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function ErrorDisplay({ error }: { error: ErrorState }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-lg border border-red-200 p-6 space-y-4"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-red-100 p-2">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-medium text-red-700">
            {error.message}
          </h4>
          {error.details && (
            <p className="mt-1 text-sm text-red-600">
              {error.details}
            </p>
          )}
        </div>
      </div>

      {error.action && (
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
          >
            Cancel
          </Button>
          {error.action.url ? (
            <Button
              variant="outline"
              onClick={() => window.open(error.action?.url, '_blank')}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {error.action.label}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={error.action.handler}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {error.action.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
