"use client"

import * as React from "react"
import { Input } from "./input"
import { LocationResult, searchAddress } from "@/lib/nominatim"
import { cn } from "@/lib/utils"

interface PlacesInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onLocationSelect?: (location: LocationResult) => void
}

export function PlacesInput({
  className,
  onLocationSelect,
  ...props
}: PlacesInputProps) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)

  const debouncedSearch = React.useCallback(
    React.useMemo(
      () =>
        debounce(async (value: string) => {
          if (!value.trim()) {
            setResults([])
            return
          }
          setIsLoading(true)
          const searchResults = await searchAddress(value)
          setResults(searchResults)
          setIsLoading(false)
        }, 300),
      []
    ),
    []
  )

  React.useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return (
    <div className="relative">
      <Input
        {...props}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowResults(true)
        }}
        className={cn("w-full", className)}
        onFocus={() => setShowResults(true)}
      />
      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-background rounded-md border shadow-lg">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <ul className="max-h-[280px] overflow-auto">
              {results.map((result, index) => (
                <li
                  key={index}
                  className="px-4 py-2 text-sm hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setQuery(result.display_name)
                    setShowResults(false)
                    onLocationSelect?.(result)
                  }}
                >
                  {result.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 