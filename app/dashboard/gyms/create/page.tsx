"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const createGymSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
})

type CreateGymFormValues = z.infer<typeof createGymSchema>

export default function CreateGymPage() {
  const [isLoading, setIsLoading] = useState(false)
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
    },
  })

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

      router.push("/dashboard/gyms")
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

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude)
          form.setValue("longitude", position.coords.longitude)
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

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard/gyms")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Gyms
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Gym</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gym Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter gym name" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter gym description" {...field} value={field.value || ""} />
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
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Location</h3>
                  <Button type="button" variant="outline" onClick={getCurrentLocation}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Current Location
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter latitude"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter longitude"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating gym..." : "Create Gym"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
