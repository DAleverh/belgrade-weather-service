import fetch from 'node-fetch';

interface TemperatureData {
  date: string;
  time: string;
  temperature: number;
  unit: string;
  weatherDescription?: string;
}

/**
 * Fetches temperature data for Belgrade around 14:00 using yr.no API
 */
export async function getTemperatures(): Promise<TemperatureData[]> {
  try {
    // Belgrade coordinates
    const latitude = 44.8176;
    const longitude = 20.4599;

    // yr.no API endpoint - Classic Weather API
    const url = `https://api.weather.gov/points/${latitude},${longitude}/forecast/hourly`;
    
    // Alternative using Open-Meteo which is more accessible
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&daily=weather_code&timezone=auto&forecast_days=16`;

    console.log('Fetching weather data from Open-Meteo API...');

    const response = await fetch(openMeteoUrl);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json() as any;

    // Extract hourly data
    const hourlyTimes: string[] = data.hourly.time;
    const temperatures: number[] = data.hourly.temperature_2m;

    // Filter temperatures around 14:00 (2:00 PM)
    const temperaturesToday: TemperatureData[] = [];

    for (let i = 0; i < hourlyTimes.length; i++) {
      const time = hourlyTimes[i];
      const hour = parseInt(time.split('T')[1].split(':')[0]);

      // Filter for 14:00 (2:00 PM) - allowing 13:00-15:00 range
      if (hour === 14 || (hour === 13 && temperatures[i + 1] === undefined) || (hour === 15 && temperatures[i - 1] === undefined)) {
        temperaturesToday.push({
          date: time.split('T')[0],
          time: time.split('T')[1].substring(0, 5),
          temperature: Math.round(temperatures[i] * 10) / 10, // Round to 1 decimal
          unit: 'Celsius',
          weatherDescription: getWeatherDescription(data.hourly.weather_code[i]),
        });
      }
    }

    // Alternative: If we can't find exact 14:00, find closest to 14:00
    if (temperaturesToday.length === 0) {
      const closestToNoon: TemperatureData[] = [];
      for (let i = 0; i < hourlyTimes.length; i++) {
        const time = hourlyTimes[i];
        const hour = parseInt(time.split('T')[1].split(':')[0]);

        if (hour === 14) {
          closestToNoon.push({
            date: time.split('T')[0],
            time: time.split('T')[1].substring(0, 5),
            temperature: Math.round(temperatures[i] * 10) / 10,
            unit: 'Celsius',
            weatherDescription: getWeatherDescription(data.hourly.weather_code[i]),
          });
        }
      }
      return closestToNoon;
    }

    return temperaturesToday;
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
