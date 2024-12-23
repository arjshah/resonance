'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Star, MapPin, Phone, Globe, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useYelpConnection } from "@/hooks/use-yelp-connection"

export function YelpBusinessCard() {
  const { business, refreshConnection } = useYelpConnection()
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  if (!business) return null

  async function handleDisconnect() {
    try {
      setIsDisconnecting(true)
      const response = await fetch('/api/business/yelp/disconnect', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      await refreshConnection()
      setShowDisconnectDialog(false)
    } catch (error) {
      console.error('Error disconnecting:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            {/* Business Name and Rating */}
            <div>
              <h2 className="text-2xl font-semibold">{business.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < business.rating 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {business.rating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({business.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{business.address}, {business.city}, {business.state} {business.zipCode}</span>
              </div>
              {business.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{business.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <a 
                  href={business.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Yelp
                </a>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowDisconnectDialog(true)}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Disconnect Yelp Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your Yelp business account? This will stop review synchronization and remove access to Yelp data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 