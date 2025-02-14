"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { LocationResult } from "@/lib/nominatim"
import { useTheme } from "next-themes"

interface LeafletMapProps {
  origin: LocationResult | null
  destination: LocationResult | null
}

export default function LeafletMap({ origin, destination }: LeafletMapProps) {
  const { theme } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([54.5, -2], 5) // Center on UK

      // Add OpenStreetMap tiles with theme-specific styling
      L.tileLayer(
        theme === "dark"
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }
      ).addTo(mapRef.current)
    }

    const map = mapRef.current

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        layer.remove()
      }
    })

    if (origin && destination) {
      try {
        // Add markers
        L.marker([parseFloat(origin.lat), parseFloat(origin.lon)])
          .bindPopup("Start Location")
          .addTo(map)

        L.marker([parseFloat(destination.lat), parseFloat(destination.lon)])
          .bindPopup("End Location")
          .addTo(map)

        // Fetch and draw route
        fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`
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
            )
              .bindPopup("Approximate direct route (actual road route unavailable)")
              .addTo(map)

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
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [origin, destination, theme])

  return (
    <div className="space-y-2">
      <div ref={mapContainerRef} className="h-[400px] w-full rounded-lg" />
      <p className="text-xs text-muted-foreground text-center">
        Map data © OpenStreetMap contributors
      </p>
    </div>
  )
} 