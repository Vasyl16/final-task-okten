/** Opens Google Maps at the given coordinates (no API key required). */
export function googleMapsSearchUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/** Driving directions in Google Maps to the destination. */
export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

/** Embed URL (requires Maps Embed API enabled for the key). */
export function googleMapsEmbedUrl(lat: number, lng: number, apiKey: string): string {
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${lat},${lng}&zoom=15`
}
