'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { loadUsers, clearError } from '@store/userSlice';
import UserCard from '@components/UserCard';
import styles from './page.module.scss';

export default function Home() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  React.useEffect(() => {
    if (users.length === 0 && !loading) {
      dispatch(loadUsers());
    }
  }, [users.length, loading, dispatch]);

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(loadUsers());
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading users...</div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>User Directory</h1>
      </header>
      <div className={styles.userGrid}>
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      {loading && users.length > 0 && (
        <div className={styles.loadingMore}>Loading weather data...</div>
      )}
    </div>
  );
}
