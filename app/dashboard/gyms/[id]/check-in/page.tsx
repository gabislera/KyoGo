"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin, ArrowLeft, CheckCircle } from "lucide-react"

interface Gym {
  id: string
  title: string
  description: string | null
  phone: string | null
  latitude: number
  longitude: number
}

export default function CheckInPage() {
  const [gym, setGym] = useState<Gym | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const gymId = params.id as string

  useEffect(() => {
    async function fetchGym() {
      try {
        // This is a workaround since we don't have a direct endpoint to get a single gym
        // In a real app, you'd have a /gyms/:id endpoint
        const response = await api.get("/gyms/search", {
          params: { q: "", page: 1 },
        })
        const foundGym = response.data.gyms.find((g: Gym) => g.id === gymId)

        if (foundGym) {
          setGym(foundGym)
        } else {
          toast({
            title: "Gym not found",
            description: "The gym you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/dashboard/gyms")
        }
      } catch (error) {
        console.error("Failed to fetch gym:", error)
        toast({
          title: "Error",
          description: "Failed to fetch gym details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Get user's location for check-in
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location access denied",
            description: "Please enable location services to check in.",
            variant: "destructive",
          })
        },
      )
    }

    fetchGym()
  }, [gymId, router, toast])

  const handleCheckIn = async () => {
    if (!userLocation) {
      toast({
        title: "Location required",
        description: "Please enable location services to check in.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingIn(true)
    try {
      await api.post(`/gyms/${gymId}/check-ins`, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      })

      toast({
        title: "Check-in successful!",
        description: "Your check-in has been recorded.",
      })

      router.push("/dashboard/check-ins")
    } catch (error: any) {
      console.error("Check-in failed:", error)

      let errorMessage = "Failed to check in. Please try again."

      if (error.response?.data?.message) {
        if (error.response.data.message.includes("distance")) {
          errorMessage = "You're too far from this gym to check in."
        } else if (error.response.data.message.includes("check-in")) {
          errorMessage = "You've already checked in today."
        }
      }

      toast({
        title: "Check-in failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Gym not found</h3>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/gyms")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gyms
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard/gyms")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Gyms
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Check In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-bold">{gym.title}</h3>
            {gym.description && <p className="text-muted-foreground">{gym.description}</p>}
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {Number(gym.latitude).toFixed(6)}, {Number(gym.longitude).toFixed(6)}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              To check in, you must be physically present at the gym. Your location will be verified.
            </p>

            {userLocation ? (
              <div className="text-sm text-muted-foreground mb-4">
                <p>Your current location:</p>
                <p className="font-mono">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-500 mb-4">Location access is required for check-in</p>
            )}

            <Button onClick={handleCheckIn} disabled={isCheckingIn || !userLocation} className="w-full">
              {isCheckingIn ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Check In Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
