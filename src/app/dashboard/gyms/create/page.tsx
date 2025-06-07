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
import { useToast } from "@/src/components/ui/use-toast"
import { api } from "@/src/lib/api"
import { useAuth } from "@/src/hooks/use-auth"
import { ArrowLeft, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import Map from "@/src/components/map"
import { NearbyGyms } from "@/src/components/nearby-gyms"

const createGymSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  address: z.object({
    zipcode: z.string().regex(/^\d{5}-?\d{3}$/, { message: 'Invalid ZIP code format. Example: 00000-000' }),
    street: z.string().min(1, { message: 'Street is required' }),
    number: z.coerce.number().min(1, { message: 'Number is required' }),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, { message: 'Neighborhood is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    state: z.string().min(1, { message: 'State is required' }),
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
  const { toast } = useToast()
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
            message: "ZIP code not found",
          })
          throw new Error("ZIP code not found")
        }

        // Set address fields
        form.setValue("address.street", data.logradouro || "")
        form.setValue("address.neighborhood", data.bairro || "")
        form.setValue("address.city", data.localidade || "")
        form.setValue("address.state", data.uf || "")

        // Immediately geocode the address to update the map
        if (data.logradouro && data.bairro && data.localidade && data.uf) {
          const address = `${data.logradouro}, ${form.getValues("address.number") || 0}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brazil`
          
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
              
              toast({
                title: "Location updated",
                description: "Map has been centered on the address.",
              })
            } else {
              toast({
                title: "Error finding location",
                description: "Could not find coordinates for this address.",
                variant: "destructive",
              })
            }
          })
        }
      } catch {
        toast({
          title: "Error fetching ZIP code",
          description: "Could not find the address for this ZIP code",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCep(false)
      }
    }

    fetchAddress()
  }, [zipcode, form, toast])

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
      const addressString = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state}, Brazil`
      
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
          
          toast({
            title: "Location updated",
            description: "Map coordinates have been updated based on the address.",
          })
        } else {
          toast({
            title: "Location not found",
            description: "Could not find coordinates for this address.",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast({
        title: "Error updating location",
        description: "Failed to get coordinates for this address.",
        variant: "destructive",
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
          toast({
            title: "Location updated",
            description: "Current location has been set.",
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location access denied",
            description: "Please enable location services or enter coordinates manually.",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
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

          toast({
            title: "Address updated",
            description: "Address fields have been updated based on the selected location.",
          })
        } else {
          toast({
            title: "Error finding address",
            description: "Could not find address for the selected location.",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error getting address:", error)
      toast({
        title: "Error updating address",
        description: "Failed to get address for the selected location.",
        variant: "destructive",
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

      toast({
        title: "Gym created successfully!",
        description: "The new gym has been added to the system.",
      })

      // Show nearby gyms instead of redirecting
      setShowNearbyGyms(true)
    } catch (error: any) {
      console.error("Failed to create gym:", error)
      toast({
        title: "Failed to create gym",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
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
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.zipcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
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
                          <FormLabel>Street</FormLabel>
                          <FormControl>
                            <Input placeholder="Street name" {...field} disabled={isLoadingCep} />
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
                          <FormLabel>Number</FormLabel>
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
                          <FormLabel>Complement</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt 123" {...field} />
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
                          <FormLabel>Neighborhood</FormLabel>
                          <FormControl>
                            <Input placeholder="Neighborhood" {...field} disabled={isLoadingCep} />
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
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} disabled={isLoadingCep} />
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} disabled={isLoadingCep} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Location</h3>
                    <Button type="button" variant="outline" onClick={getCurrentLocation} disabled={isGeocoding}>
                      <MapPin className="h-4 w-4 mr-2" />
                      {isGeocoding ? "Updating location..." : "Use Current Location"}
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
                        toast({
                          title: "Location selected",
                          description: "The coordinates have been updated.",
                        })
                      }}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isLoading}>
                  {isLoading ? "Creating gym..." : "Create Gym"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
