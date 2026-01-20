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
  dataSource?: string;
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

interface YrNoWeatherData {
  properties: {
    timeseries: Array<{
      time: string;
      data: {
        instant: {
          details: {
            air_temperature: number;
            weather_icon?: string;
          };
        };
        next_1_hours?: {
          summary: {
            symbol_code: string;
          };
        };
      };
    }>;
  };
}

/**
 * Search for locations by name using Open-Meteo geocoding API
 * (yr.no doesn't provide a public geocoding API, so we use Open-Meteo for search)
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
 * Fetches temperature data for a location around 14:00 using yr.no API
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
      `Fetching weather data from yr.no for ${coordinates.name || `(${coordinates.latitude}, ${coordinates.longitude})`}...`
    );

    // yr.no Locationforecast 2.0 API endpoint
    // Note: lat/lon parameters (not latitude/longitude), max 4 decimals precision
    // Coordinates rounded to 4 decimals for optimal caching
    // Using full endpoint (not compact) to get maximum forecast days (10 days instead of 3)
    const lat = Math.round(coordinates.latitude * 10000) / 10000;
    const lon = Math.round(coordinates.longitude * 10000) / 10000;
    const yrnoUrl = `https://api.met.no/weatherapi/locationforecast/2.0/full?lat=${lat}&lon=${lon}`;

    const response = await fetch(yrnoUrl, {
      headers: {
        'User-Agent': 'belgrade-weather-service/1.0 (https://github.com/yourusername/belgrade-weather-service)',
      },
    });

    if (!response.ok) {
      throw new Error(`yr.no API request failed: ${response.statusText}`);
    }

    const data = await response.json() as YrNoWeatherData;

    // Filter temperatures around 14:00 (2:00 PM)
    const temperaturesToday: TemperatureData[] = [];

    if (data.properties && data.properties.timeseries) {
      for (const entry of data.properties.timeseries) {
        const time = new Date(entry.time);
        const hour = time.getUTCHours();
        const dateStr = time.toISOString().split('T')[0];
        const timeStr = `${String(hour).padStart(2, '0')}:${String(time.getUTCMinutes()).padStart(2, '0')}`;

        // Include 14:00 (UTC) exactly
        if (hour === 14) {
          const symbolCode = entry.data.next_1_hours?.summary?.symbol_code || 'unknown';
          
          temperaturesToday.push({
            date: dateStr,
            time: timeStr,
            temperature: Math.round(entry.data.instant.details.air_temperature * 10) / 10,
            unit: 'Celsius',
            weatherDescription: getWeatherDescription(symbolCode),
          });
        }
      }
    }

    const response_obj: TemperatureResponse = {
      location: coordinates,
      temperatures: temperaturesToday,
      updatedAt: new Date().toISOString(),
      cached: false,
      dataSource: 'yr.no',
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
 * Maps yr.no weather symbol codes to descriptions
 * Reference: https://api.weatherapi.met.no/documentation
 */
function getWeatherDescription(code: string): string {
  const weatherCodes: { [key: string]: string } = {
    'clearsky_day': 'Clear sky',
    'clearsky_night': 'Clear sky',
    'clearsky_polartwilight': 'Clear sky',
    'fair_day': 'Fair',
    'fair_night': 'Fair',
    'fair_polartwilight': 'Fair',
    'partlycloudy_day': 'Partly cloudy',
    'partlycloudy_night': 'Partly cloudy',
    'partlycloudy_polartwilight': 'Partly cloudy',
    'cloudy': 'Overcast',
    'rainshowers_day': 'Rain showers',
    'rainshowers_night': 'Rain showers',
    'rainshowers_polartwilight': 'Rain showers',
    'rain': 'Rain',
    'heavyrain': 'Heavy rain',
    'heavyrainandthunder': 'Heavy rain and thunder',
    'sleetandthunder': 'Sleet and thunder',
    'snowandthunder': 'Snow and thunder',
    'rain_and_snow': 'Rain and snow',
    'snow': 'Snow',
    'snowshowers_day': 'Snow showers',
    'snowshowers_night': 'Snow showers',
    'snowshowers_polartwilight': 'Snow showers',
    'rainandthunder': 'Rain and thunder',
    'sleet': 'Sleet',
    'lightrainandthunder': 'Light rain and thunder',
    'heavysleetandthunder': 'Heavy sleet and thunder',
    'lightsnowandthunder': 'Light snow and thunder',
    'heavysnow': 'Heavy snow',
    'fog': 'Fog',
    'lightrain': 'Light rain',
    'heavyrainshowers_day': 'Heavy rain showers',
    'heavyrainshowers_night': 'Heavy rain showers',
    'heavyrainshowers_polartwilight': 'Heavy rain showers',
    'lightsleet': 'Light sleet',
    'heavysleet': 'Heavy sleet',
    'lightsnow': 'Light snow',
    'heavysnowshowers_day': 'Heavy snow showers',
    'heavysnowshowers_night': 'Heavy snow showers',
    'heavysnowshowers_polartwilight': 'Heavy snow showers',
    'lightrainshowers_day': 'Light rain showers',
    'lightrainshowers_night': 'Light rain showers',
    'lightrainshowers_polartwilight': 'Light rain showers',
    'lightsleetshowers_day': 'Light sleet showers',
    'lightsleetshowers_night': 'Light sleet showers',
    'lightsleetshowers_polartwilight': 'Light sleet showers',
    'lightsnowshowers_day': 'Light snow showers',
    'lightsnowshowers_night': 'Light snow showers',
    'lightsnowshowers_polartwilight': 'Light snow showers',
  };

  return weatherCodes[code] || code || 'Unknown';
}
