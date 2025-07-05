'use client';

import React, { ReactNode, createContext, useContext } from 'react';
import { PoolService } from './api/pool.service';

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
  const services: Services = {
    poolService: new PoolService(),
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