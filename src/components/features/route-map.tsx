"use client"

import dynamic from "next/dynamic"
import { LocationResult } from "@/lib/nominatim"

type VehicleType = 'car' | 'bike' | 'foot' | 'truck'

interface RouteMapProps {
  origin: LocationResult | null
  destination: LocationResult | null
  vehicle: VehicleType
}

// Dynamically import Leaflet with no SSR
const LeafletMap = dynamic(() => import("@/components/features/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
})

export function RouteMap({ origin, destination, vehicle }: RouteMapProps) {
  return <LeafletMap origin={origin} destination={destination} vehicle={vehicle} />
}