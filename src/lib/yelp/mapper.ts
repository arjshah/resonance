interface YelpBusiness {
  id: string
  name: string
  url: string
  phone: string
  location: {
    address1: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  coordinates: {
    latitude: number
    longitude: number
  }
}

export function mapYelpBusinessToDatabase(yelpBusiness: YelpBusiness) {
  return {
    // Yelp-specific fields
    yelpBusinessId: yelpBusiness.id,
    yelpBusinessName: yelpBusiness.name,
    yelpBusinessUrl: yelpBusiness.url,
    
    // General business fields (only if not already set)
    name: yelpBusiness.name,
    phone: yelpBusiness.phone,
    address: `${yelpBusiness.location.address1}, ${yelpBusiness.location.city}, ${yelpBusiness.location.state} ${yelpBusiness.location.zip_code}`,
    city: yelpBusiness.location.city,
    state: yelpBusiness.location.state,
    zipCode: yelpBusiness.location.zip_code,
    country: yelpBusiness.location.country,
    website: yelpBusiness.url
  }
} 