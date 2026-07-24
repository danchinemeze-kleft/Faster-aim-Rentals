'use client'

import React, { createContext, useState, useContext, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const value = useMemo(() => ({
    isLoading,
    showLoading,
    hideLoading,
  }), [isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <LoadingSpinner />}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};