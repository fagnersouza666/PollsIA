# CLAUDE-REACTJS.md - Guia para React.js

> **Para Claude Code**: Este documento define padrões específicos para React.js. Sempre seguir estas diretrizes junto com CLAUDE.md.

## ⚡ TL;DR para Claude Code (React.js)
```
SEMPRE:
✅ TypeScript strict mode
✅ Functional components + hooks
✅ Custom hooks para lógica reutilizável
✅ Context + useReducer para state global
✅ Error boundaries + error handling
✅ Memoization apropriada (useMemo/useCallback)
✅ Zod para validação de forms
✅ React Query para server state

NUNCA:
❌ Class components (use functional)
❌ JavaScript puro (sempre TypeScript)
❌ Props drilling excessivo
❌ State diretamente mutado
❌ useEffect sem dependencies
❌ Inline functions em JSX
❌ Any type (use tipagem específica)
❌ Fetch direto (use React Query)
```

## Estrutura de Projeto React

```
src/
├── components/               # Componentes reutilizáveis
│   ├── ui/                  # Componentes básicos (Button, Input)
│   ├── forms/               # Componentes de formulário
│   ├── layout/              # Layout components (Header, Sidebar)
│   └── common/              # Componentes comuns
├── pages/                   # Page components
│   ├── users/
│   ├── dashboard/
│   └── auth/
├── hooks/                   # Custom hooks
│   ├── queries/             # React Query hooks
│   ├── mutations/           # Mutation hooks
│   └── common/              # Utility hooks
├── contexts/                # React contexts
├── services/                # API services
│   ├── api/
│   ├── auth/
│   └── types/
├── utils/                   # Utility functions
│   ├── validation/
│   ├── formatting/
│   └── constants/
├── types/                   # TypeScript type definitions
├── store/                   # Global state (Zustand/Redux)
└── assets/                  # Static assets

tests/
├── components/
├── hooks/
├── utils/
└── __mocks__/
```

## Zero Acoplamento com Dependency Injection

### ✅ Service Layer com Interfaces
```typescript
// src/services/types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  age?: number;
}

export interface UpdateUserRequest {
  name?: string;
  age?: number;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// src/services/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    context?: Record<string, any>;
  };
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  context?: Record<string, any>;
}
```

### ✅ Service Abstraction
```typescript
// src/services/api/user.service.ts
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { User, CreateUserRequest, UpdateUserRequest, GetUsersQuery } from '../types/user.types';

export interface UserService {
  getUsers(query?: GetUsersQuery): Promise<PaginatedResponse<User>>;
  getUserById(id: string): Promise<User>;
  createUser(data: CreateUserRequest): Promise<User>;
  updateUser(id: string, data: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

// Implementation
export class HttpUserService implements UserService {
  constructor(private baseUrl: string, private httpClient: HttpClient) {}

  async getUsers(query: GetUsersQuery = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);

    const response = await this.httpClient.get<ApiResponse<PaginatedResponse<User>>>(
      `${this.baseUrl}/users?${params}`
    );

    if (!response.success) {
      throw new ApiError(response.error?.code || 'UNKNOWN_ERROR', response.error?.message || 'Unknown error');
    }

    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const response = await this.httpClient.get<ApiResponse<User>>(
      `${this.baseUrl}/users/${id}`
    );

    if (!response.success) {
      throw new ApiError(response.error?.code || 'UNKNOWN_ERROR', response.error?.message || 'Unknown error');
    }

    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const validatedData = CreateUserSchema.parse(data);

    const response = await this.httpClient.post<ApiResponse<User>>(
      `${this.baseUrl}/users`,
      validatedData
    );

    if (!response.success) {
      throw new ApiError(response.error?.code || 'UNKNOWN_ERROR', response.error?.message || 'Unknown error');
    }

    return response.data;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const validatedData = UpdateUserSchema.parse(data);

    const response = await this.httpClient.put<ApiResponse<User>>(
      `${this.baseUrl}/users/${id}`,
      validatedData
    );

    if (!response.success) {
      throw new ApiError(response.error?.code || 'UNKNOWN_ERROR', response.error?.message || 'Unknown error');
    }

    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const response = await this.httpClient.delete<ApiResponse<void>>(
      `${this.baseUrl}/users/${id}`
    );

    if (!response.success) {
      throw new ApiError(response.error?.code || 'UNKNOWN_ERROR', response.error?.message || 'Unknown error');
    }
  }
}
```

### Service Provider Pattern
```typescript
// src/services/service-provider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { UserService, HttpUserService } from './api/user.service';
import { HttpClient } from './api/http-client';

interface Services {
  userService: UserService;
}

const ServicesContext = createContext<Services | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children, 
  baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api' 
}) => {
  const httpClient = new HttpClient();
  
  const services: Services = {
    userService: new HttpUserService(baseUrl, httpClient),
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

// Usage in App.tsx
export const App: React.FC = () => {
  return (
    <ServiceProvider>
      <QueryClient client={queryClient}>
        <Router>
          <Routes>
            {/* Your routes */}
          </Routes>
        </Router>
      </QueryClient>
    </ServiceProvider>
  );
};
```

## Error Handling Robusto

### Error Boundary
```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to external service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Something went wrong
              </h1>
            </div>
            
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-3 bg-red-50 rounded border">
                <summary className="font-medium text-red-800 cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-sm text-red-700 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleRetry}
              className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Types and Custom Errors
```typescript
// src/utils/errors.ts
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class ApiError extends BaseError {
  readonly statusCode: number;

  constructor(
    public readonly code: string,
    message: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message, context);
    this.statusCode = statusCode;
  }
}

export class NetworkError extends BaseError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 503;
}

export class NotFoundError extends BaseError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

// Error utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof BaseError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string => {
  if (error instanceof BaseError) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
};
```

## Custom Hooks para Reusabilidade

### Query Hooks com React Query
```typescript
// src/hooks/queries/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../services/service-provider';
import { GetUsersQuery, CreateUserRequest, UpdateUserRequest } from '../../services/types/user.types';

export const useUsers = (query?: GetUsersQuery) => {
  const { userService } = useServices();

  return useQuery({
    queryKey: ['users', query],
    queryFn: () => userService.getUsers(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Failed to fetch users:', error);
    },
  });
};

export const useUser = (id: string, enabled: boolean = true) => {
  const { userService } = useServices();

  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof NotFoundError) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useCreateUser = () => {
  const { userService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: (newUser) => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Optimistically update user cache
      queryClient.setQueryData(['user', newUser.id], newUser);
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
};

export const useUpdateUser = () => {
  const { userService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      userService.updateUser(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Update specific user cache
      queryClient.setQueryData(['user', id], updatedUser);
      
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};

export const useDeleteUser = () => {
  const { userService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['user', deletedId] });
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });
};
```

### Form Hooks
```typescript
// src/hooks/common/useForm.ts
import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>) => {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const validate = useCallback((values: T): Partial<Record<keyof T, string>> => {
    if (!validationSchema) return {};

    try {
      validationSchema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T;
          if (path) {
            errors[path] = err.message;
          }
        });
        return errors;
      }
      return {};
    }
  }, [validationSchema]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setState((prev) => {
      const newValues = { ...prev.values, [field]: value };
      const errors = validate(newValues);
      
      return {
        ...prev,
        values: newValues,
        errors,
        isValid: Object.keys(errors).length === 0,
      };
    });
  }, [validate]);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  const handleChange = useCallback((field: keyof T) => (
    