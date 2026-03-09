export interface AladhanParams {
    address: string;
    method?: number; // Calculation method (e.g., 2 is ISNA, 3 is MWL)
}

export interface AladhanCoordParams {
    latitude: number;
    longitude: number;
    method?: number;
    date?: string; // DD-MM-YYYY format
}

export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird: string;
    Lastthird: string;
}

export interface AladhanResponse {
    code: number;
    status: string;
    data: {
        timings: PrayerTimes;
        date: {
            readable: string;
            timestamp: string;
            gregorian: any;
            hijri: any;
        };
        meta: any;
    };
}

/**
 * Fetches prayer times from the Aladhan API based on an address.
 * 
 * @param params Address and optional calculation method
 * @returns Promise<PrayerTimes>
 */
export async function fetchPrayerTimesByAddress(params: AladhanParams): Promise<PrayerTimes> {
    const { address, method = 2 } = params; // Default to ISNA if method not provided

    if (!address) {
        throw new Error("Address is required to fetch prayer times.");
    }

    try {
        const url = new URL("http://api.aladhan.com/v1/timingsByAddress");
        url.searchParams.append("address", address);
        url.searchParams.append("method", method.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Failed to fetch prayer times: ${response.status} ${response.statusText}`);
        }

        const json = await response.json() as AladhanResponse;

        if (json.code !== 200) {
            throw new Error(`Aladhan API error: ${json.status}`);
        }

        // The API returns times in HH:MM format (sometimes with (TZ) attached, we clean it up)
        const cleanTimings: Partial<PrayerTimes> = {};
        for (const [key, value] of Object.entries(json.data.timings)) {
            // value is usually like "05:42 (EST)", we only want "05:42"
            cleanTimings[key as keyof PrayerTimes] = value.split(' ')[0];
        }

        return cleanTimings as PrayerTimes;

    } catch (error) {
        console.error("Error fetching from Aladhan API:", error);
        throw error;
    }
}

/**
 * Fetches prayer times from the Aladhan API based on exact coordinates.
 * 
 * @param params Latitude, longitude, and optional calculation method
 * @returns Promise<PrayerTimes>
 */
export async function fetchPrayerTimesByCoordinates(params: AladhanCoordParams): Promise<PrayerTimes> {
    const { latitude, longitude, method = 2, date } = params;

    try {
        const datePath = date || '';
        const url = new URL(`http://api.aladhan.com/v1/timings/${datePath}`);
        url.searchParams.append("latitude", latitude.toString());
        url.searchParams.append("longitude", longitude.toString());
        url.searchParams.append("method", method.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Failed to fetch prayer times: ${response.status} ${response.statusText}`);
        }

        const json = await response.json() as AladhanResponse;

        if (json.code !== 200) {
            throw new Error(`Aladhan API error: ${json.status}`);
        }

        const cleanTimings: Partial<PrayerTimes> = {};
        for (const [key, value] of Object.entries(json.data.timings)) {
            cleanTimings[key as keyof PrayerTimes] = value.split(' ')[0];
        }

        return cleanTimings as PrayerTimes;

    } catch (error) {
        console.error("Error fetching from Aladhan API by coordinates:", error);
        throw error;
    }
}
