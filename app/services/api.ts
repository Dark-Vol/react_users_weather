import { fetchWeatherApi } from 'openmeteo';
import { RandomUserResponse, WeatherResponse, User } from '@types';

const RANDOM_USER_API = 'https://randomuser.me/api/?results=10';
const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(RANDOM_USER_API);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const data: RandomUserResponse = await response.json();
    
    // Add ID to each user based on login.uuid (guaranteed unique) or fallback
    return data.results.map((user, index) => ({
      ...user,
      id: user.login?.uuid || user.login?.username || user.email || `user-${index}`,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchWeather = async (
  latitude: number,
  longitude: number,
  includeForecast: boolean = false
): Promise<WeatherResponse> => {
  try {
    const params = {
      latitude: latitude,
      longitude: longitude,
      current_weather: true,
      daily: ['temperature_2m_max', 'temperature_2m_min', 'weathercode'],
      timezone: 'auto',
    };

    const responses = await fetchWeatherApi(OPEN_METEO_API, params);
    const response = responses[0];

    if (!response) {
      throw new Error('No weather data received');
    }

    // Attributes for timezone and location
    const responseLatitude = response.latitude();
    const responseLongitude = response.longitude();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    // Helper function to form time range
    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Get daily data
    const daily = response.daily()!;
    const dailyMaxTempsArray = daily.variables(0)!.valuesArray()!;
    const dailyMinTempsArray = daily.variables(1)!.valuesArray()!;
    const dailyWeathercodesArray = daily.variables(2)!.valuesArray()!;
    
    // Convert Float32Array to regular arrays
    const dailyMaxTemps = Array.from(dailyMaxTempsArray);
    const dailyMinTemps = Array.from(dailyMinTempsArray);
    const dailyWeathercodes = Array.from(dailyWeathercodesArray);
    const dailyTimes = range(Number(daily.time()), Number(daily.timeEnd()), daily.interval());

    // Current weather - use today's daily data as current weather
    // For sunny weather (code 0 or 1), use max temperature; otherwise use average
    const todayWeathercode = dailyWeathercodes[0];
    const isSunny = todayWeathercode === 0 || todayWeathercode === 1;
    const currentTemperature = isSunny 
      ? dailyMaxTemps[0]  // Use max temperature for sunny weather
      : (dailyMaxTemps[0] + dailyMinTemps[0]) / 2; // Average for other weather
    
    const currentWeatherData = {
      temperature: currentTemperature,
      weathercode: todayWeathercode,
      time: new Date((dailyTimes[0] + utcOffsetSeconds) * 1000).toISOString(),
    };

    // Daily weather data
    const dailyData = {
      time: dailyTimes.map(
        (t) => new Date((t + utcOffsetSeconds) * 1000).toISOString().split('T')[0]
      ),
      temperature_2m_max: dailyMaxTemps,
      temperature_2m_min: dailyMinTemps,
      weathercode: dailyWeathercodes,
    };

    return {
      current_weather: currentWeatherData,
      daily: dailyData,
      latitude: responseLatitude,
      longitude: responseLongitude,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

