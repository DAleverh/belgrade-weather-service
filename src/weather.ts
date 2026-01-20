import fetch from 'node-fetch';
import NodeCache from 'node-cache';

// Cache for 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface TemperatureData {
  date: string;
  time: string;
  temperature: number;
  unit: string;
  weatherDescription?: string;
}

export interface TemperatureResponse {
  location: LocationCoordinates;
  temperatures: TemperatureData[];
  updatedAt: string;
  cached?: boolean;
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

/**
 * Search for locations by name using Open-Meteo geocoding API
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding API failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.results) {
      return [];
    }

    return data.results.map((result: any) => ({
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      country: result.country,
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
}

/**
 * Get coordinates for a location name
 */
export async function getLocationCoordinates(locationName: string): Promise<LocationCoordinates> {
  try {
    const results = await searchLocations(locationName);
    if (results.length === 0) {
      throw new Error(`Location "${locationName}" not found`);
    }

    const firstResult = results[0];
    return {
      latitude: firstResult.latitude,
      longitude: firstResult.longitude,
      name: `${firstResult.name}, ${firstResult.country}`,
    };
  } catch (error) {
    console.error('Error getting location coordinates:', error);
    throw error;
  }
}

/**
 * Fetches temperature data for a location around 14:00
 */
export async function getTemperatures(
  location?: LocationCoordinates | string,
  forceRefresh: boolean = false
): Promise<TemperatureResponse> {
  try {
    // Default to Belgrade if no location provided
    let coordinates: LocationCoordinates = {
      latitude: 44.8176,
      longitude: 20.4599,
      name: 'Belgrade',
    };

    if (location) {
      if (typeof location === 'string') {
        coordinates = await getLocationCoordinates(location);
      } else {
        coordinates = location;
      }
    }

    // Create cache key
    const cacheKey = `temp_${coordinates.latitude}_${coordinates.longitude}`;

    // Check cache if not forcing refresh
    if (!forceRefresh) {
      const cachedData = cache.get<TemperatureResponse>(cacheKey);
      if (cachedData) {
        return { ...cachedData, cached: true };
      }
    }

    console.log(
      `Fetching weather data for ${coordinates.name || `(${coordinates.latitude}, ${coordinates.longitude})`}...`
    );

    // Open-Meteo API endpoint
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&hourly=temperature_2m,weather_code&daily=weather_code&timezone=auto&forecast_days=16`;

    const response = await fetch(openMeteoUrl);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json() as any;

    // Extract hourly data
    const hourlyTimes: string[] = data.hourly.time;
    const temperatures: number[] = data.hourly.temperature_2m;
    const weatherCodes: number[] = data.hourly.weather_code;

    // Filter temperatures around 14:00 (2:00 PM)
    const temperaturesToday: TemperatureData[] = [];

    for (let i = 0; i < hourlyTimes.length; i++) {
      const time = hourlyTimes[i];
      const hour = parseInt(time.split('T')[1].split(':')[0]);

      // Include 14:00 exactly
      if (hour === 14) {
        temperaturesToday.push({
          date: time.split('T')[0],
          time: time.split('T')[1].substring(0, 5),
          temperature: Math.round(temperatures[i] * 10) / 10,
          unit: 'Celsius',
          weatherDescription: getWeatherDescription(weatherCodes[i]),
        });
      }
    }

    const response_obj: TemperatureResponse = {
      location: coordinates,
      temperatures: temperaturesToday,
      updatedAt: new Date().toISOString(),
      cached: false,
    };

    // Cache the result
    cache.set(cacheKey, response_obj);

    return response_obj;
  } catch (error) {
    console.error('Error in getTemperatures:', error);
    throw error;
  }
}

/**
 * Maps WMO weather codes to descriptions
 */
function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  return weatherCodes[code] || 'Unknown';
}
