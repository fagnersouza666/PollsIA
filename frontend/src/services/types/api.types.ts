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

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HttpClient {
  get<T>(_url: string, _config?: RequestConfig): Promise<T>;
  post<T>(_url: string, _data?: any, _config?: RequestConfig): Promise<T>;
  put<T>(_url: string, _data?: any, _config?: RequestConfig): Promise<T>;
  delete<T>(_url: string, _config?: RequestConfig): Promise<T>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}