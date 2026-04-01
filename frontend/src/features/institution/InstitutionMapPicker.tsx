import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useCallback, useMemo } from 'react'

const DEFAULT_CENTER = { lat: 50.4501, lng: 30.5234 }

const mapContainerStyle = {
  width: '100%',
  height: '280px',
}

type InstitutionMapPickerProps = {
  apiKey: string
  lat: number | null
  lng: number | null
  /** Called whenever coordinates change (map click or marker drag end). */
  onCoordinatesChange: (lat: number, lng: number) => void
}

export function InstitutionMapPicker({
  apiKey,
  lat,
  lng,
  onCoordinatesChange,
}: InstitutionMapPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'institution-map-script',
  })

  const applyPosition = useCallback(
    (nextLat: number, nextLng: number) => {
      onCoordinatesChange(nextLat, nextLng)
    },
    [onCoordinatesChange],
  )

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const latLng = event.latLng
      if (!latLng) {
        return
      }

      applyPosition(latLng.lat(), latLng.lng())
    },
    [applyPosition],
  )

  const handleMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const latLng = event.latLng
      if (!latLng) {
        return
      }

      applyPosition(latLng.lat(), latLng.lng())
    },
    [applyPosition],
  )

  const mapCenter = useMemo(
    () => (lat !== null && lng !== null ? { lat, lng } : DEFAULT_CENTER),
    [lat, lng],
  )

  const mapZoom = useMemo(
    () => (lat !== null && lng !== null ? 15 : 11),
    [lat, lng],
  )

  const markerPosition = useMemo(
    () => (lat !== null && lng !== null ? { lat, lng } : null),
    [lat, lng],
  )

  const mapOptions = useMemo(
    (): google.maps.MapOptions => ({
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
      draggable: true,
      scrollwheel: true,
      keyboardShortcuts: true,
      clickableIcons: false,
    }),
    [],
  )

  if (!apiKey.trim()) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
        Додайте змінну <code className="rounded bg-muted px-1">VITE_GOOGLE_MAPS_API_KEY</code> у{' '}
        <code className="rounded bg-muted px-1">frontend/.env</code>, щоб обрати місце на карті.
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Не вдалося завантажити Google Maps. Перевірте ключ API.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-2xl border bg-muted/30 text-sm text-muted-foreground">
        Завантажуємо карту...
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Перетягуйте карту, щоб знайти місце. Клацніть по карті або перетягніть маркер, щоб вказати
        точку закладу. Місто введіть у полі нижче.
      </p>
      <div className="overflow-hidden rounded-2xl border">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {markerPosition ? (
            <Marker
              position={markerPosition}
              draggable
              title="Перетягніть, щоб змінити точку"
              onDragEnd={handleMarkerDragEnd}
            />
          ) : null}
        </GoogleMap>
      </div>
    </div>
  )
}
