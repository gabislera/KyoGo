"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/src/lib/api"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { toast } from "sonner"
import { Loader2, MapPin, ArrowLeft, CheckCircle } from "lucide-react"
import Map from "@/src/components/map"

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
          toast.error("Academia não encontrada", {
            description: "A academia que você está procurando não existe.",
          })
          router.push("/dashboard/gyms")
        }
      } catch (error) {
        console.error("Falha ao buscar academia:", error)
        toast.error("Erro", {
          description: "Falha ao obter detalhes da academia.",
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
          console.error("Erro ao obter localização:", error)
          toast.error("Acesso à localização negado", {
            description: "Por favor, habilite os serviços de localização para fazer check-in.",
          })
        },
      )
    }

    fetchGym()
  }, [gymId, router])

  const handleCheckIn = async () => {
    if (!userLocation) {
      toast.error("Localização necessária", {
        description: "Por favor, habilite os serviços de localização para fazer check-in.",
      })
      return
    }

    setIsCheckingIn(true)
    try {
      await api.post(`/gyms/${gymId}/check-ins`, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      })

      toast.success("Check-in realizado com sucesso!")

      router.push("/dashboard/check-ins")
    } catch (error: any) {
      console.error("Falha no check-in:", error)

      let errorMessage = "Falha ao fazer check-in. Por favor, tente novamente."

      if (error.response?.data?.message) {
        if (error.response.data.message.includes("Max distance reached")) {
          errorMessage = "Você está muito longe da academia."
        } else if (error.response.data.message.includes("check-in")) {
          errorMessage = "Você já fez check-in hoje."
        }
      }

      toast.error("Falha no check-in", {
        description: errorMessage,
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
        <h3 className="text-lg font-medium">Academia não encontrada</h3>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/gyms")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Academias
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard/gyms")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Academias
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-bold">{gym.title}</h3>
            {gym.description && <p className="text-muted-foreground">{gym.description}</p>}
            <div className="mt-4 rounded-lg overflow-hidden">
              <Map latitude={Number(gym.latitude)} longitude={Number(gym.longitude)} height="200px" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Para fazer check-in, você deve estar fisicamente presente na academia. Sua localização será verificada.
            </p>

            {/* {userLocation ? (
              <div className="text-sm text-muted-foreground mb-4">
                <p>Sua localização atual:</p>
                <div className="mt-2 rounded-lg overflow-hidden">
                  <Map latitude={userLocation.latitude} longitude={userLocation.longitude} height="200px" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-rose-500 mb-4">Acesso à localização é necessário para check-in</p>
            )} */}

            <Button onClick={handleCheckIn} disabled={isCheckingIn || !userLocation} className="w-full">
              {isCheckingIn ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Fazer Check-in Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}