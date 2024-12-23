'use client'

import { useState, useEffect } from 'react';
import { ImageIcon, X, Building2, MapPin, Phone, Mail, Globe, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BusinessProfile() {
  const [logo, setLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
    }
  });

  useEffect(() => {
    async function fetchBusinessProfile() {
      try {
        const response = await fetch('/api/business-profile');
        if (!response.ok) throw new Error('Failed to fetch business profile');
        
        const business = await response.json();
        
        // Reset form with existing data
        reset({
          name: business.name || '',
          description: business.description || '',
          address: business.address || '',
          city: business.city || '',
          state: business.state || '',
          zipCode: business.zipCode || '',
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
        });
      } catch (error) {
        console.error('Error fetching business profile:', error);
        setError('root', { 
          type: 'fetch',
          message: 'Failed to load business profile' 
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBusinessProfile();
  }, [reset, setError]);

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Loading business profile...</p>
        </div>
      </div>
    );
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setLogo(file);
    } else {
      alert('Please upload an image file');
    }
  };

  const handleLogoRemove = () => {
    setLogo(null);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      if (logo) formData.append('logo', logo);

      const response = await fetch('/api/business-profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save profile');
      
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('root', { 
        type: 'submit',
        message: 'Failed to save profile. Please try again.' 
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">Business Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business information and settings
          </p>
        </div>
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
              {/* Logo Upload */}
              <div className="flex items-center gap-x-6">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50/50">
                  {logo ? (
                    <>
                      <img
                        src={URL.createObjectURL(logo)}
                        alt="Business logo"
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleLogoRemove}
                        className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-inset ring-stone-200 hover:bg-stone-50"
                      >
                        <X className="h-4 w-4 text-stone-500" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-10 w-10 text-stone-300" />
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="relative"
                        >
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="absolute inset-0 w-full cursor-pointer opacity-0"
                          />
                        </Button>
                        <p className="mt-1 text-xs text-muted-foreground">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-6 text-gray-900">
                      Business Name
                    </label>
                    <Input
                      {...register('name', { required: 'Business name is required' })}
                      className={errors.name ? 'border-red-300' : ''}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-6 text-gray-900">
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
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-6 text-gray-900">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-6 text-gray-900">
                      Website
                    </label>
                    <Input
                      type="url"
                      {...register('website')}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-6 text-gray-900">
                      Address
                    </label>
                    <Input
                      {...register('address')}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium leading-6 text-gray-900">
                        City
                      </label>
                      <Input
                        {...register('city')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-6 text-gray-900">
                        State
                      </label>
                      <Input
                        {...register('state')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-6 text-gray-900">
                        ZIP
                      </label>
                      <Input
                        {...register('zipCode')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                {errors.root && (
                  <Alert variant="destructive" className="mr-4">
                    <AlertDescription>{errors.root.message}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 