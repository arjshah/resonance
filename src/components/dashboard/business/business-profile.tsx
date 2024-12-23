'use client'

import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  googleBusinessUrl?: string;
}

interface NotificationState {
  type: 'success' | 'error' | 'saving' | null;
  message: string;
  details?: string;
}

export function BusinessProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    type: null,
    message: ''
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<BusinessData>();

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch('/api/business-profile');
        if (!response.ok) throw new Error('Failed to fetch business profile');
        const data = await response.json();
        setBusiness(data);
        reset(data);
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBusiness();
  }, [reset]);

  const onSubmit = async (data: BusinessData) => {
    try {
      setNotification({
        type: 'saving',
        message: 'Saving your business profile...',
        details: 'Please wait while we update your information'
      });

      const response = await fetch('/api/business-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }
      
      const updatedBusiness = await response.json();
      setBusiness(updatedBusiness);
      
      setNotification({
        type: 'success',
        message: 'Business profile updated successfully',
        details: 'All changes have been saved and are now live'
      });

      setTimeout(() => {
        setNotification({ type: null, message: '' });
      }, 5000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save profile',
        details: error instanceof Error ? error.message : 'Please try again or contact support if the issue persists'
      });
    }
  };

  const NotificationContent = () => {
    if (!notification.type) return null;

    const variants = {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    };

    return (
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          "rounded-lg border-2 transition-all duration-200",
          {
            'border-emerald-100 bg-emerald-50/50': notification.type === 'success',
            'border-red-100 bg-red-50/50': notification.type === 'error',
            'border-stone-100 bg-stone-50/50': notification.type === 'saving'
          }
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
              {notification.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {notification.type === 'saving' && (
                <RefreshCcw className="h-5 w-5 text-stone-500 animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                {
                  'text-emerald-600': notification.type === 'success',
                  'text-red-600': notification.type === 'error',
                  'text-stone-600': notification.type === 'saving'
                }
              )}>
                {notification.message}
              </p>
              {notification.details && (
                <p className={cn(
                  "mt-1 text-sm",
                  {
                    'text-emerald-500': notification.type === 'success',
                    'text-red-500': notification.type === 'error',
                    'text-stone-500': notification.type === 'saving'
                  }
                )}>
                  {notification.details}
                </p>
              )}
            </div>
            {notification.type !== 'saving' && (
              <button
                type="button"
                onClick={() => setNotification({ type: null, message: '' })}
                className="flex-shrink-0 rounded-full p-1 hover:bg-stone-100"
              >
                <XCircle className="h-4 w-4 text-stone-400" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="p-6 rounded-lg bg-stone-50 animate-pulse">
          <div className="h-6 bg-stone-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-stone-200 rounded w-1/2" />
            <div className="h-4 bg-stone-200 rounded w-2/3" />
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="p-6 rounded-lg border border-stone-100 space-y-6">
          <div className="space-y-4">
            <div className="h-4 bg-stone-100 rounded w-1/4" />
            <div className="h-10 bg-stone-50 rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-stone-100 rounded w-1/4" />
            <div className="h-10 bg-stone-50 rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-stone-100 rounded w-1/4" />
            <div className="h-10 bg-stone-50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light">Business Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your business information and settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-stone-600" />
              <CardTitle className="text-xl font-light">Business Information</CardTitle>
            </div>
            <CardDescription>
              Update your business details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Form Fields */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Business Name & Description */}
                <div className="col-span-2 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-600">
                      Business Name
                    </label>
                    <Input
                      {...register('name', { required: 'Business name is required' })}
                      className={errors.name ? 'border-red-300' : ''}
                      placeholder="Enter your business name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-600">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="min-h-[100px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2"
                      placeholder="Describe your business"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-600">
                      Email
                    </label>
                    <Input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={errors.email ? 'border-red-300' : ''}
                      placeholder="contact@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-600">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      {...register('phone')}
                      placeholder="(555) 555-5555"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-600">
                      Website
                    </label>
                    <Input
                      type="url"
                      {...register('website')}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-600">
                      Street Address
                    </label>
                    <Input
                      {...register('address')}
                      placeholder="123 Business St"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-600">
                        City
                      </label>
                      <Input
                        {...register('city')}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600">
                        State
                      </label>
                      <Input
                        {...register('state')}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600">
                        ZIP Code
                      </label>
                      <Input
                        {...register('zipCode')}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Notification Area */}
              <AnimatePresence mode="wait">
                {notification.type && <NotificationContent />}
              </AnimatePresence>

              {/* Form Actions */}
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || notification.type === 'saving'}
                  className={cn(
                    "bg-stone-900 text-white hover:bg-stone-800",
                    (isSubmitting || notification.type === 'saving') && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting || notification.type === 'saving' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 