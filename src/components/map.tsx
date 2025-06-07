"use client"

import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api"
import { useMemo, useEffect, useRef } from "react"

interface MapProps {
  latitude: number
  longitude: number
  height?: string
  width?: string
  center?: { lat: number; lng: number }
  onMapClick?: (lat: number, lng: number) => void
}

const Map = ({ latitude, longitude, height = "300px", width = "100%", center, onMapClick }: MapProps) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const defaultCenter = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude])
  const mapCenter = center || defaultCenter

  // Handle center updates
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.panTo(center)
      mapRef.current.setZoom(15)
    }
  }, [center])

  if (!isLoaded) {
    return <div className="w-full h-[300px] bg-muted animate-pulse rounded-lg" />
  }

  return (
    <GoogleMap
      zoom={15}
      center={mapCenter}
      mapContainerStyle={{ width, height }}
      onLoad={(map) => {
        mapRef.current = map
      }}
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
      <Marker position={defaultCenter} />
    </GoogleMap>
  )
}

export default Map 