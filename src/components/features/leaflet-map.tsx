"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { LocationResult } from "@/lib/nominatim"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Map as MapIcon, Satellite } from "lucide-react"

type VehicleType = 'car' | 'bike' | 'foot' | 'truck'

interface LeafletMapProps {
  origin: LocationResult | null
  destination: LocationResult | null
  vehicle: VehicleType
}

export default function LeafletMap({ origin, destination, vehicle }: LeafletMapProps) {
  const { theme } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street')

  // Map layer URLs
  const mapLayers = {
    street: {
      light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    },
    satellite: {
      light: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      dark: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([54.5, -2], 5) // Center on UK
    }

    const map = mapRef.current

    // Clear existing tile layers
    map.eachLayer((layer) => {
      layer.remove()
    })

    // Add selected map layer
    L.tileLayer(
      mapLayers[mapStyle][theme === 'dark' ? 'dark' : 'light'],
      {
        attribution: mapStyle === 'street' 
          ? '© OpenStreetMap contributors'
          : '© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }
    ).addTo(map)

    if (origin && destination) {
      try {
        // Create custom circle markers instead of default markers
        L.circleMarker([parseFloat(origin.lat), parseFloat(origin.lon)], {
          radius: 8,
          fillColor: theme === "dark" ? "#60a5fa" : "#0066cc",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map)

        L.circleMarker([parseFloat(destination.lat), parseFloat(destination.lon)], {
          radius: 8,
          fillColor: theme === "dark" ? "#60a5fa" : "#0066cc",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map)

        // Fetch and draw route based on vehicle type
        const profile = vehicle === 'truck' ? 'driving-hgv' : vehicle
        fetch(
          `https://router.project-osrm.org/route/v1/${profile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.routes && data.routes[0]) {
              // Draw the actual route line
              L.geoJSON(data.routes[0].geometry, {
                style: {
                  color: theme === "dark" ? "#60a5fa" : "#0066cc",
                  weight: 4,
                  opacity: 0.7
                }
              }).addTo(map)

              // Fit map to show the entire route
              const bounds = L.latLngBounds([
                [parseFloat(origin.lat), parseFloat(origin.lon)],
                [parseFloat(destination.lat), parseFloat(destination.lon)]
              ])
              map.fitBounds(bounds, { padding: [50, 50] })
            }
          })
          .catch((error) => {
            console.error("Error fetching route:", error)
            // Fallback to straight line if route fetch fails
            L.polyline(
              [
                [parseFloat(origin.lat), parseFloat(origin.lon)],
                [parseFloat(destination.lat), parseFloat(destination.lon)]
              ],
              {
                color: theme === "dark" ? "#ef4444" : "#dc2626",
                weight: 3,
                opacity: 0.7,
                dashArray: "10, 10"
              }
            ).addTo(map)

            // Fit map to show the entire route
            const bounds = L.latLngBounds([
              [parseFloat(origin.lat), parseFloat(origin.lon)],
              [parseFloat(destination.lat), parseFloat(destination.lon)]
            ])
            map.fitBounds(bounds, { padding: [50, 50] })
          })
      } catch (error) {
        console.error("Error setting up map markers/route:", error)
      }
    }

    return () => {
      // Cleanup is handled by the removal of all layers
    }
  }, [origin, destination, theme, vehicle, mapStyle])

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        {/* Map Style Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMapStyle(prev => prev === 'street' ? 'satellite' : 'street')}
        >
          {mapStyle === 'street' ? (
            <Satellite className="h-4 w-4 mr-1" />
          ) : (
            <MapIcon className="h-4 w-4 mr-1" />
          )}
          {mapStyle === 'street' ? 'Satellite' : 'Street'}
        </Button>
      </div>

      <div ref={mapContainerRef} className="h-[400px] w-full rounded-lg" />
      
      <p className="text-xs text-muted-foreground text-center">
        {mapStyle === 'street' 
          ? '© OpenStreetMap contributors'
          : '© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'}
      </p>
    </div>
  )
} 