"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { useAuth } from "@/src/hooks/use-auth"
import { api } from "@/src/lib/api"
import { Calendar, MapPin, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/src/components/ui/skeleton"

interface CheckInMetrics {
  checkInsCount: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<CheckInMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await api.get("/check-ins/metrics")
        setMetrics(response.data)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-red-500 pl-4">
        <h1 className="text-3xl font-bold">Bem-vindo de volta, {user?.name}</h1>
        <p className="text-muted-foreground">Continue sua jornada fitness com disciplina e foco</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold flex items-center">
                {metrics?.checkInsCount || 0}
                <CheckCircle className="ml-2 h-5 w-5 text-rose-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Função</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {user?.role === "ADMIN" ? (
                  <span className="text-rose-500">Administrador</span>
                ) : (
                  <span className="text-orange-500">Membro</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membro Desde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              <Calendar className="ml-2 h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard/gyms">
                <MapPin className="mr-2 h-4 w-4" />
                Encontrar Academias
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/check-ins">
                <CheckCircle className="mr-2 h-4 w-4" />
                Ver Histórico de Check-ins
              </Link>
            </Button>
            {user?.role === "ADMIN" && (
              <Button asChild variant="secondary" className="w-full">
                <Link href="/dashboard/gyms/create">
                  <MapPin className="mr-2 h-4 w-4" />
                  Criar Nova Academia
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : metrics?.checkInsCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum check-in ainda. Comece sua jornada fitness hoje!</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/gyms">Encontrar Academias</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Veja seu histórico completo de check-ins</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/dashboard/check-ins">Histórico de Check-ins</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
