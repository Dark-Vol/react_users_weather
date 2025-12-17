'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserWithWeather } from '@types';
import { getWeatherIcon } from '@utils/weatherIcons';
import styles from './UserCard.module.scss';

interface UserCardProps {
  user: UserWithWeather;
}

export default function UserCard({ user }: UserCardProps) {
  const fullName = `${user.name.first} ${user.name.last}`;
  const location = `${user.location.city}, ${user.location.country}`;
  const weather = user.weather?.current;
  const daily = user.weather?.daily;

  // Get min and max temperatures from daily data (today)
  const minTemp = daily?.temperature_2m_min[0];
  const maxTemp = daily?.temperature_2m_max[0];

  return (
    <Link href={`/users/${user.id}`} className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.userInfo}>
          <Image
            src={user.picture.large}
            alt={fullName}
            width={80}
            height={80}
            className={styles.avatar}
          />
          <div className={styles.userDetails}>
            <h2 className={styles.name}>{fullName}</h2>
            <p className={styles.gender}>{user.gender}</p>
            <p className={styles.location}>{location}</p>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>
        
        {weather && (
          <div className={styles.weatherInfo}>
            <div className={styles.weatherIcon}>
              {getWeatherIcon(weather.weathercode)}
            </div>
            <div className={styles.temperature}>
              <div className={styles.currentTemp}>
                {Math.round(weather.temperature)}°C
              </div>
              {minTemp !== undefined && maxTemp !== undefined && (
                <div className={styles.tempRange}>
                  <span>H: {Math.round(maxTemp)}°</span>
                  <span>L: {Math.round(minTemp)}°</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

