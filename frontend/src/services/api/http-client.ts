import { HttpClient, RequestConfig } from '../types/api.types';
import { NetworkError, ApiError } from '../../utils/errors';

export class FetchHttpClient implements HttpClient {
  constructor(private baseUrl: string = '') {}

  private async request<T>(
    url: string,
    options: RequestInit,
    config?: RequestConfig
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = config?.timeout || 10000;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fullUrl = this.baseUrl + url;
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.code || 'HTTP_ERROR',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.context
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(error.message);
      }

      throw new NetworkError('Unknown network error');
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { method: 'GET' }, config);
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(
      url,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' }, config);
  }
}