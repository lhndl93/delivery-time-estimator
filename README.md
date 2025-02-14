# UK Journey Time Calculator

A modern journey time calculation tool built with Next.js 14 and TypeScript. This application helps calculate driving times between UK locations, with time estimates based on historical traffic patterns and known congestion points.

## Features

- 🚗 Accurate base journey time calculations using OSRM (Open Source Routing Machine)
- 🚦 Time-based journey estimates considering:
  - Common rush hours (7-9 AM, 4-6 PM on weekdays)
  - Weekend vs weekday patterns
  - Known M25 congestion points
- 🗺️ Interactive route visualization with Leaflet maps
- 🌓 Dark/Light theme support
- 📱 Responsive, mobile-first design
- 🎯 UK-focused location search with OpenStreetMap data
- 🎨 Modern UI with Radix UI components and Tailwind CSS

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [OSRM](http://project-osrm.org/) - Route calculations
- [OpenStreetMap/Nominatim](https://nominatim.org/) - Geocoding
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/uk-journey-time-calculator.git
   ```

2. Install dependencies:
   ```bash
   cd uk-journey-time-calculator
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   │   └── traffic/    # Time-based predictions
│   ├── layout.tsx      # Root layout with theme provider
│   └── page.tsx        # Main page component
├── components/         
│   ├── ui/            # Reusable UI components
│   └── features/      # Feature-specific components
└── lib/               # Utility functions and types
```

## How It Works

1. **Location Search**: Uses OpenStreetMap's Nominatim API to search for UK locations
2. **Route Calculation**: Utilizes OSRM for accurate base journey time and distance calculations
3. **Journey Time Estimates**: 
   - Considers time of day and day of week
   - Applies multipliers during peak hours
   - Includes known congestion points along major routes
4. **Route Visualization**: 
   - Displays the route on an interactive map
   - Shows potential delay points
   - Supports both light and dark themes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
