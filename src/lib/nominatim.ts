export interface LocationResult {
  display_name: string
  lat: string
  lon: string
  type: string
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  type: string
  address: {
    country: string
    country_code?: string
  }
}

export async function searchAddress(query: string): Promise<LocationResult[]> {
  if (!query.trim()) return []
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=gb&limit=5&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en-GB,en;q=0.9",
          "User-Agent": "DeliveryTimeEstimator/1.0",
        },
      }
    )
    
    if (!response.ok) throw new Error("Failed to fetch address suggestions")
    
    const data: NominatimResult[] = await response.json()
    return data
      .filter(item => 
        item.address.country_code === "gb" || 
        item.address.country === "United Kingdom"
      )
      .map(item => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
      }))
  } catch (error) {
    console.error("Error searching address:", error)
    return []
  }
} 