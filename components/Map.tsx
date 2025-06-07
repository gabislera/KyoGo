"use client"

import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api"
import { useMemo } from "react"

interface MapProps {
  latitude: number
  longitude: number
  height?: string
  width?: string
  onMapClick?: (lat: number, lng: number) => void
}

const Map = ({ latitude, longitude, height = "300px", width = "100%", onMapClick }: MapProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude])

  if (!isLoaded) {
    return <div className="w-full h-[300px] bg-muted animate-pulse rounded-lg" />
  }

  return (
    <GoogleMap
      zoom={15}
      center={center}
      mapContainerStyle={{ width, height }}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
      onClick={(e) => {
        if (e.latLng && onMapClick) {
          onMapClick(e.latLng.lat(), e.latLng.lng())
        }
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  )
}

export default Map 