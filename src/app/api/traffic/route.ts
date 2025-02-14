import { NextResponse } from 'next/server';

interface TrafficEvent {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  coordinates: {
    lat: number;
    lon: number;
  };
}

interface PredictiveTrafficModel {
  timeMultiplier: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// Simplified traffic prediction based on time of day
function getTrafficPrediction(hour: number, isWeekend: boolean): PredictiveTrafficModel {
  // Rush hours on weekdays
  if (!isWeekend) {
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
      return {
        timeMultiplier: 1.5,
        description: 'Rush hour traffic expected',
        severity: 'high',
      };
    }
    if ((hour >= 10 && hour <= 15) || (hour >= 19 && hour <= 21)) {
      return {
        timeMultiplier: 1.2,
        description: 'Moderate traffic expected',
        severity: 'medium',
      };
    }
  }
  // Weekend or off-peak
  return {
    timeMultiplier: 1.0,
    description: 'Light traffic expected',
    severity: 'low',
  };
}

// Common congestion points along major routes
const KNOWN_CONGESTION_POINTS: TrafficEvent[] = [
  {
    id: 'M25-J10',
    description: 'M25 Junction 10 (A3 Interchange) - Common congestion point',
    severity: 'medium',
    coordinates: { lat: 51.3183, lon: -0.4343 },
  },
  {
    id: 'M25-J15',
    description: 'M25 Junction 15 (M4 Interchange) - Regular delays',
    severity: 'medium',
    coordinates: { lat: 51.4972, lon: -0.5594 },
  },
  {
    id: 'M25-J21',
    description: 'M25 Junction 21 (M1 Interchange) - Heavy traffic area',
    severity: 'high',
    coordinates: { lat: 51.6767, lon: -0.3854 },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minLat = parseFloat(searchParams.get('minLat') || '0');
  const maxLat = parseFloat(searchParams.get('maxLat') || '0');
  const minLon = parseFloat(searchParams.get('minLon') || '0');
  const maxLon = parseFloat(searchParams.get('maxLon') || '0');

  // Get current time
  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  // Get traffic prediction for current time
  const prediction = getTrafficPrediction(hour, isWeekend);

  // Filter congestion points within the bounding box
  const relevantCongestionPoints = KNOWN_CONGESTION_POINTS.filter(point => {
    return (
      point.coordinates.lat >= minLat &&
      point.coordinates.lat <= maxLat &&
      point.coordinates.lon >= minLon &&
      point.coordinates.lon <= maxLon
    );
  });

  // Adjust severity based on time prediction
  const trafficEvents = relevantCongestionPoints.map(point => ({
    ...point,
    severity: prediction.timeMultiplier > 1.3 ? 'high' : point.severity,
    description: `${point.description}. ${prediction.description}`,
  }));

  return NextResponse.json({
    trafficEvents,
    prediction: {
      timeMultiplier: prediction.timeMultiplier,
      description: prediction.description,
    },
  });
} 