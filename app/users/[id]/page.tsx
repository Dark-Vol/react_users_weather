'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { selectUser, loadUserWeather, clearError } from '@store/userSlice';
import { getWeatherIcon, getWeatherDescription } from '@utils/weatherIcons';
import styles from './page.module.scss';

export default function UserDetailPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { selectedUser, users, loading, error } = useAppSelector((state) => state.user);

  React.useEffect(() => {
    if (users.length === 0) {
      router.push('/');
      return;
    }
    
    dispatch(selectUser(userId));
    const user = users.find(u => u.id === userId);
    if (user && !user.weather) {
      dispatch(loadUserWeather(userId));
    }
  }, [userId, users, dispatch, router]);

  const user = selectedUser || users.find(u => u.id === userId);

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>User not found</p>
          <button onClick={() => router.push('/')} className={styles.backButton}>
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.name.first} ${user.name.last}`;
  const location = `${user.location.city}, ${user.location.country}`;
  const weather = user.weather?.current;
  const daily = user.weather?.daily;

  const forecastDays = daily ? daily.time.slice(0, 7).map((date: string, index: number) => ({
    date,
    weathercode: daily.weathercode[index],
    maxTemp: daily.temperature_2m_max[index],
    minTemp: daily.temperature_2m_min[index],
  })) : [];

  return (
    <div className={styles.container}>
      <button onClick={() => router.push('/')} className={styles.backButton}>
        ← Back to User List
      </button>

      {error && (
        <div className={styles.errorBanner}>
          <p>Error: {error}</p>
          <button onClick={() => dispatch(clearError())} className={styles.dismissButton}>Dismiss</button>
        </div>
      )}

      <div className={styles.userDetail}>
        <div className={styles.userHeader}>
          <Image
            src={user.picture.large}
            alt={fullName}
            width={150}
            height={150}
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <h1 className={styles.name}>{fullName}</h1>
            <p className={styles.gender}>{user.gender}</p>
            <p className={styles.location}>{location}</p>
            <p className={styles.email}>{user.email}</p>
          </div>
          {weather && (
            <div className={styles.currentWeather}>
              <div className={styles.weatherIcon}>
                {getWeatherIcon(weather.weathercode)}
              </div>
              <div className={styles.currentTemp}>
                {Math.round(weather.temperature)}°C
              </div>
              <div className={styles.weatherDesc}>
                {getWeatherDescription(weather.weathercode)}
              </div>
            </div>
          )}
        </div>

        {loading && !weather && (
          <div className={styles.loading}>Loading weather forecast...</div>
        )}

        {forecastDays.length > 0 && (
          <div className={styles.forecastSection}>
            <h2 className={styles.sectionTitle}>7-Day Weather Forecast</h2>
            <div className={styles.forecastGrid}>
              {forecastDays.map((day, index: number) => {
                const date = new Date(day.date);
                const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={day.date} className={styles.forecastCard}>
                    <div className={styles.forecastDate}>
                      <div className={styles.dayName}>{dayName}</div>
                      <div className={styles.dateStr}>{dateStr}</div>
                    </div>
                    <div className={styles.forecastIcon}>
                      {getWeatherIcon(day.weathercode)}
                    </div>
                    <div className={styles.forecastTemps}>
                      <span className={styles.maxTemp}>H: {Math.round(day.maxTemp)}°</span>
                      <span className={styles.minTemp}>L: {Math.round(day.minTemp)}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

