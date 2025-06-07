"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/src/lib/api"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardFooter } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useToast } from "@/src/components/ui/use-toast"
import { Loader2, Search, MapPin, Dumbbell } from "lucide-react"
import { useAuth } from "@/src/hooks/use-auth"
import Map from "@/src/components/map"

interface Gym {
  id: string
  title: string
  description: string | null
  phone: string | null
  latitude: number
  longitude: number
}

export default function GymsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [gyms, setGyms] = useState<Gym[]>([])
  const [nearbyGyms, setNearbyGyms] = useState<Gym[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Get user's location for nearby gyms
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          fetchNearbyGyms(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location access denied",
            description: "Please enable location services to find nearby gyms.",
            variant: "destructive",
          })
        },
      )
    }
  }, [toast])

  const fetchNearbyGyms = async (latitude: number, longitude: number) => {
    setIsLoadingNearby(true)
    try {
      const response = await api.get("/gyms/nearby", {
        params: { latitude, longitude },
      })
      setNearbyGyms(response.data.gyms)
    } catch (error) {
      console.error("Failed to fetch nearby gyms:", error)
      toast({
        title: "Error",
        description: "Failed to fetch nearby gyms.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNearby(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await api.get("/gyms/search", {
        params: { q: searchQuery },
      })
      setGyms(response.data.gyms)
    } catch (error) {
      console.error("Failed to search gyms:", error)
      toast({
        title: "Error",
        description: "Failed to search gyms.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = (gymId: string) => {
    router.push(`/dashboard/gyms/${gymId}/check-in`)
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-red-500 pl-4">
      <h1 className="text-3xl font-bold">Encontre Locais de Treinamento</h1>
      <p className="text-muted-foreground">Descubra dojôs e academias para a sua prática</p>

      </div>

      <Tabs defaultValue="nearby">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nearby">Próximas</TabsTrigger>
          <TabsTrigger value="search">Buscar</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar academias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 focus:border-red-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Buscar</span>
            </Button>
          </div>

          {gyms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gyms.map((gym) => (
                <GymCard key={gym.id} gym={gym} onCheckIn={() => handleCheckIn(gym.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Nenhuma academia encontrada</h3>
              <p className="text-muted-foreground">Tente buscar por um nome diferente</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="nearby" className="space-y-4">
          {isLoadingNearby ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : nearbyGyms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyGyms.map((gym) => (
                <GymCard key={gym.id} gym={gym} onCheckIn={() => handleCheckIn(gym.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Nenhuma academia próxima</h3>
              <p className="text-muted-foreground">Não há academias próximas à sua localização atual</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {user?.role === "ADMIN" && (
        <div className="flex justify-end">
          <Button onClick={() => router.push("/dashboard/gyms/create")}>Criar Nova Academia</Button>
        </div>
      )}
    </div>
  )
}

function GymCard({
  gym,
  onCheckIn,
}: {
  gym: Gym
  onCheckIn: () => void
}) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex flex-col flex-1">
          <h3 className="text-lg font-bold mb-2">{gym.title}</h3>
          {gym.description && <p className="text-muted-foreground text-sm mb-4">{gym.description}</p>}
          {gym.phone && (
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <span>📞 {gym.phone}</span>
            </div>
          )}
        </div>
        <div className="mt-4 rounded-lg overflow-hidden">
          <Map latitude={Number(gym.latitude)} longitude={Number(gym.longitude)} height="200px" />
        </div>
      </CardContent>
      <CardFooter className="bg-secondary/20 p-4">
        <Button onClick={onCheckIn} className="w-full">
          Fazer Check-in
        </Button>
      </CardFooter>
    </Card>
  )
}
