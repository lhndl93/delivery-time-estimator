# Delivery Time Estimator

A modern delivery time calculation tool built with Next.js 14 and TypeScript. This application helps logistics professionals estimate accurate delivery times by considering distance, traffic patterns, and common delays.

## Features

- 🚚 Accurate delivery time calculations
- 📱 Responsive, mobile-first design
- 🗺️ Integration with Google Maps
- ⚡ Real-time updates
- 🎨 Modern, clean UI with Radix UI components

## Tech Stack

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Google Maps API](https://developers.google.com/maps)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/delivery-time-estimator.git
   ```

2. Install dependencies:
   ```bash
   cd delivery-time-estimator
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Google Maps API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable components
│   ├── ui/             # UI components
│   └── features/       # Feature-specific components
├── lib/                # Utility functions
└── types/              # TypeScript types
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
