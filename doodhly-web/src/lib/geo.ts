interface ReverseGeocodeResult {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    display_name: string;
}

/**
 * Converts latitude/longitude coordinates into a human-readable address.
 * Uses OSM Nominatim (Free, but subject to usage limits - ideal for dev).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'Doodhly-Web-App-Dev'
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const addr = data.address;

        return {
            street: addr.road || addr.pedestrian || addr.path || "",
            area: addr.suburb || addr.neighbourhood || addr.residential || addr.state_district || "",
            city: addr.city || addr.town || addr.village || "Sakti",
            state: addr.state || "",
            pincode: addr.postcode || "",
            display_name: data.display_name
        };
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return null;
    }
}
