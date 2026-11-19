/**
 * Hotel Velora Location & Google Maps Directions Utilities
 */

export const HOTEL_OFFICIAL_ADDRESS =
  "Sobujbag, Savar Bus Stand, Savar, Dhaka, Bangladesh";

export const HOTEL_LOCATION_QUERY =
  "Sobujbag, savar bus stand, savar, dhaka, bangladesh";

/**
 * Opens Google Maps directions from the guest's current location to the hotel location:
 * "Sobujbag, savar bus stand, savar, dhaka, bangladesh"
 *
 * If browser geolocation is granted, it includes origin coordinates (&origin=lat,lng).
 * If geolocation is denied or unavailable, it falls back to the Google Maps universal
 * directions URL with destination pre-filled so Google Maps can automatically use
 * the device location.
 */
export function openGoogleMapsDirections(
  destination: string = HOTEL_LOCATION_QUERY
): void {
  if (typeof window === "undefined") return;

  const encodedDest = encodeURIComponent(destination);

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodedDest}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      (error) => {
        console.warn("Geolocation access not granted or failed:", error.message);
        // Fallback to destination-only directions (Google Maps will ask for location on site/app)
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;
        window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  } else {
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;
    window.open(fallbackUrl, "_blank", "noopener,noreferrer");
  }
}
