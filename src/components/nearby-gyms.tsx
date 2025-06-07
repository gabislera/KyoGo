"use client"

import { useEffect, useState } from "react"
import { api } from "@/src/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { MapPin, Phone, Mail } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"

interface Gym {
  id: string
  title: string
  description: string | null
  phone: string | null
  latitude: number
  longitude: number
}

interface NearbyGymsProps {
  latitude: number
  longitude: number
  radius?: number // in kilometers
}

export function NearbyGyms({ latitude, longitude, radius = 5 }: NearbyGymsProps) {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchNearbyGyms = async () => {
      try {
        const response = await api.get("/gyms/nearby", {
          params: {
            latitude,
            longitude,
            radius,
          },
        })
        setGyms(response.data.gyms)
      } catch (error) {
        console.error("Error fetching nearby gyms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (latitude && longitude) {
      fetchNearbyGyms()
    }
  }, [latitude, longitude, radius])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Loading nearby gyms...</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (gyms.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No nearby gyms found</h3>
        <p className="text-muted-foreground">
          There are no gyms within {radius}km of this location.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Nearby Gyms</h3>
      <div className="grid gap-4">
        {gyms.map((gym) => (
          <Card key={gym.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{gym.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/gyms/${gym.id}`)}
                >
                  View Details
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gym.description && <p className="text-sm">{gym.description}</p>}
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {Number(gym.latitude).toFixed(6)}, {Number(gym.longitude).toFixed(6)}
                </div>
                {gym.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {gym.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 