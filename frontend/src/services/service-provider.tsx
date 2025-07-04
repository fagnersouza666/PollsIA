'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { PoolService, HttpPoolService } from './api/pool.service';
import { FetchHttpClient } from './api/http-client';

interface Services {
  poolService: PoolService;
}

const ServicesContext = createContext<Services | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children, 
  baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api' 
}) => {
  const httpClient = new FetchHttpClient(baseUrl);
  
  const services: Services = {
    poolService: new HttpPoolService(httpClient),
  };

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = (): Services => {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return services;
};