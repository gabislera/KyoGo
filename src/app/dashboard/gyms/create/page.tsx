"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/src/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { api } from "@/src/lib/api"
import { useAuth } from "@/src/hooks/use-auth"
import { ArrowLeft, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import Map from "@/src/components/map"
import { NearbyGyms } from "@/src/components/nearby-gyms"
import { toast } from "sonner"

const createGymSchema = z.object({
  title: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().min(-90, "A latitude deve estar entre -90 e 90").max(90, "A latitude deve estar entre -90 e 90"),
  longitude: z
    .number()
    .min(-180, "A longitude deve estar entre -180 e 180")
    .max(180, "A longitude deve estar entre -180 e 180"),
  address: z.object({
    zipcode: z.string().regex(/^\d{5}-?\d{3}$/, { message: 'Formato de CEP inválido. Exemplo: 00000-000' }),
    street: z.string().min(1, { message: 'Rua é obrigatória' }),
    number: z.coerce.number().min(1, { message: 'Número é obrigatório' }),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
    city: z.string().min(1, { message: 'Cidade é obrigatória' }),
    state: z.string().min(1, { message: 'Estado é obrigatório' }),
  }),
})

type CreateGymFormValues = z.infer<typeof createGymSchema>

export default function CreateGymPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 })
  const [showNearbyGyms, setShowNearbyGyms] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const form = useForm<CreateGymFormValues>({
    resolver: zodResolver(createGymSchema),
    defaultValues: {
      title: "",
      description: "",
      phone: "",
      latitude: 0,
      longitude: 0,
      address: {
        zipcode: "",
        street: "",
        number: 0,
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
    },
  })

  const zipcode = form.watch("address.zipcode")

  // ViaCEP integration
  useEffect(() => {
    const cleanCep = zipcode?.replace(/\D/g, "")

    if (cleanCep?.length !== 8) return

    const fetchAddress = async () => {
      setIsLoadingCep(true)

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()

        if (data.erro) {
          form.setError("address.zipcode", {
            type: "manual",
            message: "CEP não encontrado",
          })
          throw new Error("CEP não encontrado")
        }

        // Set address fields
        form.setValue("address.street", data.logradouro || "")
        form.setValue("address.neighborhood", data.bairro || "")
        form.setValue("address.city", data.localidade || "")
        form.setValue("address.state", data.uf || "")

        // Immediately geocode the address to update the map
        if (data.logradouro && data.bairro && data.localidade && data.uf) {
          const address = `${data.logradouro}, ${form.getValues("address.number") || 0}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`
          
          // Use Google Maps Geocoding API
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const location = results[0].geometry.location
              const lat = location.lat()
              const lng = location.lng()
              
              // Update form values
              form.setValue("latitude", lat)
              form.setValue("longitude", lng)
              
              // Update map center
              setMapCenter({ lat, lng })
              
              toast.success("Localização atualizada")
            } else {
              toast.error("Erro ao encontrar localização")
            }
          })
        }
      } catch {
        toast.error("Erro ao buscar CEP", {
          description: "CEP não encontrado ou inválido"
        })
      } finally {
        setIsLoadingCep(false)
      }
    }

    fetchAddress()
  }, [zipcode, form])

  // Function to geocode address to coordinates
  const geocodeAddress = async (address: {
    street: string
    number: number
    neighborhood: string
    city: string
    state: string
  }) => {
    setIsGeocoding(true)
    try {
      const addressString = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state}, Brasil`
      
      // Use Google Maps Geocoding API
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: addressString }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location
          const lat = location.lat()
          const lng = location.lng()
          
          // Update form values
          form.setValue("latitude", lat)
          form.setValue("longitude", lng)
          
          // Update map center
          setMapCenter({ lat, lng })
          
          toast.success("Localização atualizada")
        } else {
          toast.error("Localização não encontrada")
        }
      })
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast.error("Erro ao atualizar localização", {
        description: "Falha ao obter coordenadas para este endereço."
      })
    } finally {
      setIsGeocoding(false)
    }
  }

  // Remove the separate geocoding effect since we're handling it in the ViaCEP effect
  // This prevents double geocoding when the address is auto-completed
  const address = form.watch("address")
  useEffect(() => {
    if (
      address.street &&
      address.number &&
      address.neighborhood &&
      address.city &&
      address.state &&
      !isLoadingCep && // Prevent geocoding while ViaCEP is loading
      !zipcode // Only geocode on manual address changes, not when ZIP code is entered
    ) {
      geocodeAddress(address)
    }
  }, [address.street, address.number, address.neighborhood, address.city, address.state])

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          form.setValue("latitude", lat)
          form.setValue("longitude", lng)
          setMapCenter({ lat, lng })
          toast.success("Localização atualizada")
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Acesso à localização negado", {
            description: "Por favor, habilite os serviços de localização ou insira coordenadas manualmente."
          })
        },
      )
    } else {
      toast.error("Geolocalização não suportada", {
        description: "Seu navegador não suporta geolocalização."
      })
    }
  }

  // Get user's location when component mounts
  useEffect(() => {
    getCurrentLocation()
  }, [])

  // Function to get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const addressComponents = results[0].address_components
          const formattedAddress = results[0].formatted_address

          // Extract address components
          const street = addressComponents.find(
            (component) => component.types.includes("route")
          )?.long_name || ""
          
          const number = addressComponents.find(
            (component) => component.types.includes("street_number")
          )?.long_name || ""

          const neighborhood = addressComponents.find(
            (component) => component.types.includes("sublocality_level_1")
          )?.long_name || ""

          const city = addressComponents.find(
            (component) => component.types.includes("administrative_area_level_2")
          )?.long_name || ""

          const state = addressComponents.find(
            (component) => component.types.includes("administrative_area_level_1")
          )?.short_name || ""

          const zipcode = addressComponents.find(
            (component) => component.types.includes("postal_code")
          )?.long_name || ""

          // Update form fields
          form.setValue("address.street", street)
          form.setValue("address.number", number ? parseInt(number) : 0)
          form.setValue("address.neighborhood", neighborhood)
          form.setValue("address.city", city)
          form.setValue("address.state", state)
          form.setValue("address.zipcode", zipcode)

          toast.success("Endereço atualizado")
        } else {
          toast.error("Erro ao encontrar endereço", {
            description: "Endereço não encontrado para a localização selecionada."
          })
        }
      })
    } catch (error) {
      console.error("Error getting address:", error)
      toast.error("Erro ao atualizar endereço", {
        description: "Falha ao obter endereço para a localização selecionada."
      })
    }
  }

  // Redirect if not admin
  if (user?.role !== "ADMIN") {
    router.push("/dashboard")
    return null
  }

  async function onSubmit(data: CreateGymFormValues) {
    setIsLoading(true)
    try {
      await api.post("/gyms", {
        ...data,
        description: data.description || null,
        phone: data.phone || null,
      })

      toast.success("Academia criada com sucesso!")

      // Show nearby gyms instead of redirecting
      setShowNearbyGyms(true)
    } catch (error: any) {
      console.error("Failed to create gym:", error)
      toast.error("Erro ao criar academia", {
        description: error.response?.data?.message || "Tente novamente mais tarde"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard/gyms")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Academias
      </Button>

      <div className="space-y-6">
        {/* <Card>
          <CardHeader>
            <CardTitle>Academias Próximas</CardTitle>
          </CardHeader>
          <CardContent>
            <NearbyGyms
              latitude={form.getValues("latitude")}
              longitude={form.getValues("longitude")}
              radius={5}
            />
          </CardContent>
        </Card> */}
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Academia</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Academia</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da academia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite a descrição da academia" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o telefone" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Endereço</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.zipcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="00000-000" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "")
                                const masked = value.replace(/^(\d{5})(\d)/, "$1-$2")
                                field.onChange(masked)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} disabled={isLoadingCep} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="123" 
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} disabled={isLoadingCep} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} disabled={isLoadingCep} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" {...field} disabled={isLoadingCep} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Localização</h3>
                    <Button type="button" variant="outline" onClick={getCurrentLocation} disabled={isGeocoding}>
                      <MapPin className="h-4 w-4 mr-2" />
                      {isGeocoding ? "Atualizando localização..." : "Usar minha localização"}
                    </Button>
                  </div>

                  <div className="rounded-lg overflow-hidden">
                    <Map 
                      latitude={form.watch("latitude") || 0} 
                      longitude={form.watch("longitude") || 0} 
                      height="300px"
                      center={mapCenter}
                      onMapClick={(lat, lng) => {
                        form.setValue("latitude", lat)
                        form.setValue("longitude", lng)
                        setMapCenter({ lat, lng })
                        getAddressFromCoordinates(lat, lng)
                        toast.success("Coordenadas atualizadas")
                      }}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isLoading}>
                  {isLoading ? "Criando academia..." : "Criar Academia"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}