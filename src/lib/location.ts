import { headers } from 'next/headers'

export async function getUserLocation(request: Request): Promise<string | null> {
  try {
    // Try to get location from CloudFlare headers
    const headersList = await headers()
    const cfCity = headersList.get('cf-ipcity')
    const cfRegion = headersList.get('cf-region')
    
    if (cfCity && cfRegion) {
      return `${cfCity}, ${cfRegion}`
    }

    // Try to get location from IP geolocation service
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip')
    
    if (ip) {
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      if (response.ok) {
        const data = await response.json()
        if (data.city && data.region) {
          return `${data.city}, ${data.region}`
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error getting user location:', error)
    return null
  }
} 