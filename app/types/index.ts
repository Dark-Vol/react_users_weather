// Random User API types
export interface RandomUserResponse {
  results: RandomUser[];
}

export interface RandomUser {
  name: {
    first: string;
    last: string;
  };
  gender: string;
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  location: {
    city: string;
    country: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  login?: {
    uuid?: string;
    username?: string;
  };
}

// User type with ID added
export interface User extends RandomUser {
  id: string;
}

// Weather API types
export interface CurrentWeather {
  temperature: number;
  weathercode: number;
  time: string;
}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export interface WeatherResponse {
  current_weather: CurrentWeather;
  daily: DailyWeather;
  latitude: number;
  longitude: number;
}

// User with weather data
export interface UserWithWeather extends User {
  weather?: {
    current: CurrentWeather;
    daily: DailyWeather;
  };
}
