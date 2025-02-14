"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PlacesInput } from "@/components/ui/places-input"
import { LocationResult } from "@/lib/nominatim"
import { RouteMap } from "./route-map"
import { AlertTriangle, AlertCircle, Construction, Car, Bike, Truck, PersonStanding } from "lucide-react"

interface TrafficEvent {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high'
  coordinates: {
    lat: number
    lon: number
  }
}

type VehicleType = 'car' | 'bike' | 'foot' | 'truck'

// Average speeds in mph for different modes
const AVERAGE_SPEEDS = {
  walking: 3.1, // Average walking speed
  cycling: 12,  // Average cycling speed
} as const

export function DeliveryCalculator() {
  const [origin, setOrigin] = React.useState<LocationResult | null>(null)
  const [destination, setDestination] = React.useState<LocationResult | null>(null)
  const [estimatedTime, setEstimatedTime] = React.useState<string | null>(null)
  const [showMap, setShowMap] = React.useState(false)
  const [trafficEvents, setTrafficEvents] = React.useState<TrafficEvent[]>([])
  const [vehicle, setVehicle] = React.useState<VehicleType>('car')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination) return

    setEstimatedTime("Calculating...")
    setShowMap(true)
    setTrafficEvents([])
    
    try {
      // Fetch traffic events first to get the multiplier
      const minLat = Math.min(parseFloat(origin.lat), parseFloat(destination.lat))
      const maxLat = Math.max(parseFloat(origin.lat), parseFloat(destination.lat))
      const minLon = Math.min(parseFloat(origin.lon), parseFloat(destination.lon))
      const maxLon = Math.max(parseFloat(origin.lon), parseFloat(destination.lon))

      const trafficResponse = await fetch(
        `/api/traffic?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`
      )
      
      if (!trafficResponse.ok) throw new Error("Failed to fetch traffic data")
      
      const trafficData = await trafficResponse.json()
      setTrafficEvents(trafficData.trafficEvents)

      // Fetch route data with correct vehicle profile
      const profile = vehicle === 'truck' ? 'driving-hgv' : vehicle
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full`
      )
      
      if (!response.ok) throw new Error("Failed to fetch route")
      
      const data = await response.json()
      
      if (!data.routes?.[0]) throw new Error("No route found")
      
      // Convert distance from meters to miles
      const distanceMiles = parseFloat((data.routes[0].distance * 0.000621371).toFixed(1))

      // Calculate time based on mode of transport
      let adjustedTimeHours: number

      if (vehicle === 'foot') {
        // Calculate walking time based on actual distance and average walking speed
        adjustedTimeHours = distanceMiles / AVERAGE_SPEEDS.walking
        if (adjustedTimeHours > 8) {
          throw new Error("Distance too far for walking")
        }
      } else if (vehicle === 'bike') {
        // Calculate cycling time based on actual distance and average cycling speed
        adjustedTimeHours = distanceMiles / AVERAGE_SPEEDS.cycling
        if (adjustedTimeHours > 8) {
          throw new Error("Distance too far for cycling")
        }
      } else {
        // For vehicles, use OSRM time with traffic adjustments
        const baseTimeHours = data.routes[0].duration / 3600
        adjustedTimeHours = baseTimeHours * (trafficData.prediction.timeMultiplier || 1)
      }
      
      const hours = Math.floor(adjustedTimeHours)
      const minutes = Math.round((adjustedTimeHours - hours) * 60)

      // Create mode-specific description
      const modeDescription = {
        car: 'driving',
        bike: 'cycling',
        foot: 'walking',
        truck: 'HGV driving'
      }[vehicle]

      // Add warning for long journeys
      const timeWarning = (vehicle === 'foot' || vehicle === 'bike') && adjustedTimeHours > 4
        ? ' (Long journey - consider breaks)'
        : ''
      
      setEstimatedTime(
        `Estimated ${modeDescription} time: ${hours ? `${hours}h ` : ""}${minutes}min (${distanceMiles} miles)${
          ['car', 'truck'].includes(vehicle) && trafficData.prediction.timeMultiplier > 1 
            ? ` - Including ${trafficData.prediction.description.toLowerCase()}`
            : ""
        }${timeWarning}`
      )

    } catch (error: unknown) {
      console.error("Error calculating route:", error)
      if (error instanceof Error && 
          (error.message === "Distance too far for walking" || 
           error.message === "Distance too far for cycling")) {
        setEstimatedTime(`Distance too far for ${vehicle === 'foot' ? 'walking' : 'cycling'}. Please choose another mode of transport.`)
      } else {
        setEstimatedTime("Error calculating time")
      }
    }
  }

  const getEventIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Construction className="h-4 w-4 text-orange-500" />
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8 bg-card rounded-lg border shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          UK Journey Time Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate driving time between UK locations
        </p>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="origin">Start Location</Label>
              <PlacesInput
                id="origin"
                placeholder="Enter UK start location"
                onLocationSelect={(loc) => {
                  setOrigin(loc)
                  setShowMap(false)
                  setTrafficEvents([])
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">End Location</Label>
              <PlacesInput
                id="destination"
                placeholder="Enter UK end location"
                onLocationSelect={(loc) => {
                  setDestination(loc)
                  setShowMap(false)
                  setTrafficEvents([])
                }}
                required
              />
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label>Transport Mode</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={vehicle === 'car' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVehicle('car')}
              >
                <Car className="h-4 w-4 mr-1" />
                Car
              </Button>
              <Button
                type="button"
                variant={vehicle === 'bike' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVehicle('bike')}
              >
                <Bike className="h-4 w-4 mr-1" />
                Bike
              </Button>
              <Button
                type="button"
                variant={vehicle === 'truck' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVehicle('truck')}
              >
                <Truck className="h-4 w-4 mr-1" />
                Truck
              </Button>
              <Button
                type="button"
                variant={vehicle === 'foot' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVehicle('foot')}
              >
                <PersonStanding className="h-4 w-4 mr-1" />
                Walking
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!origin || !destination}
          >
            Calculate Time
          </Button>
        </form>
        {estimatedTime && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted p-4">
              <p className="text-center font-medium text-foreground">{estimatedTime}</p>
              {trafficEvents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Route Alerts:</p>
                  <div className="space-y-2">
                    {trafficEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2 text-sm p-2 rounded bg-background"
                      >
                        {getEventIcon(event.severity)}
                        <div>
                          <p className="font-medium">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {showMap && origin && destination && (
              <RouteMap 
                origin={origin} 
                destination={destination} 
                vehicle={vehicle}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
} 