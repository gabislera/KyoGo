"use client"

import { useState, useEffect } from "react"
import { api } from "@/src/lib/api"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Loader2, CheckCircle, Calendar } from "lucide-react"
import { useAuth } from "@/src/hooks/use-auth"
import Link from "next/link"
import { toast } from "sonner"

interface CheckIn {
  id: string
  created_at: string
  validated_at: string | null
  gym_id: string
  user_id: string
  gym?: {
    title: string
  }
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({})
  const { user } = useAuth()

  useEffect(() => {
    fetchCheckIns()
  }, [page])

  const fetchCheckIns = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/check-ins/history", {
        params: { page },
      })

      // Fetch gym details for each check-in
      // In a real app, the API would ideally return this data already
      const checkInsWithGyms = await Promise.all(
        response.data.checkIns.map(async (checkIn: CheckIn) => {
          try {
            // This is a workaround since we don't have a direct endpoint to get a single gym
            const gymResponse = await api.get("/gyms/search", {
              params: { q: "", page: 1 },
            })
            const gym = gymResponse.data.gyms.find((g: any) => g.id === checkIn.gym_id)
            return { ...checkIn, gym: { title: gym?.title || "Unknown Gym" } }
          } catch (error) {
            return { ...checkIn, gym: { title: "Unknown Gym" } }
          }
        }),
      )

      setCheckIns(checkInsWithGyms)
    } catch (error) {
      console.error("Failed to fetch check-ins:", error)
      toast.error("Erro ao carregar check-ins", {
        description: "Tente novamente mais tarde"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidateCheckIn = async (checkInId: string) => {
    setIsValidating((prev) => ({ ...prev, [checkInId]: true }))
    try {
      await api.patch(`/check-ins/${checkInId}/validate`)

      // Update the check-in in the list
      setCheckIns((prevCheckIns) =>
        prevCheckIns.map((checkIn) =>
          checkIn.id === checkInId ? { ...checkIn, validated_at: new Date().toISOString() } : checkIn,
        ),
      )

      toast.success("Check-in validado com sucesso!")
    } catch (error) {
      toast.error("Falha na validação", {
        description: "Falha ao validar o check-in. Pode ser tarde demais para validar.",
      })
    } finally {
      setIsValidating((prev) => ({ ...prev, [checkInId]: false }))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Check-ins</h1>
        <p className="text-muted-foreground">Veja seus check-ins anteriores em várias academias</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : checkIns.length > 0 ? (
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <Card key={checkIn.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{checkIn.gym?.title || "Academia Desconhecida"}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(checkIn.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {checkIn.validated_at ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        <span>Validado</span>
                      </div>
                    ) : user?.role === "ADMIN" ? (
                      <Button
                        size="sm"
                        onClick={() => handleValidateCheckIn(checkIn.id)}
                        disabled={isValidating[checkIn.id]}
                      >
                        {isValidating[checkIn.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Validar
                      </Button>
                    ) : (
                      <div className="text-sm text-muted-foreground">Aguardando validação</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <span className="flex items-center px-4">Página {page}</span>
            <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={checkIns.length < 20}>
              Próxima
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nenhum check-in ainda</h3>
          <p className="text-muted-foreground">Comece sua jornada fitness fazendo check-in em uma academia</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/gyms">Encontrar Academias</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
