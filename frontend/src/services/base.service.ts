import { FetchHttpClient } from './api/http-client'
import { ApiResponse, RequestConfig } from './types/api.types'

export abstract class BaseService {
  protected httpClient: FetchHttpClient
  protected baseEndpoint: string

  constructor(baseEndpoint: string, baseUrl?: string) {
    this.httpClient = new FetchHttpClient(baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    this.baseEndpoint = baseEndpoint
  }

  /**
   * Wrapper para GET requests que retorna dados tipados
   */
  protected async get<T>(
    endpoint = '', 
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.httpClient.get<ApiResponse<T>>(url, config)
    return this.handleResponse(response)
  }

  /**
   * Wrapper para POST requests que retorna dados tipados
   */
  protected async post<T>(
    endpoint = '',
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.httpClient.post<ApiResponse<T>>(url, data, config)
    return this.handleResponse(response)
  }

  /**
   * Wrapper para PUT requests que retorna dados tipados
   */
  protected async put<T>(
    endpoint = '',
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.httpClient.put<ApiResponse<T>>(url, data, config)
    return this.handleResponse(response)
  }

  /**
   * Wrapper para DELETE requests que retorna dados tipados
   */
  protected async delete<T>(
    endpoint = '',
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.httpClient.delete<ApiResponse<T>>(url, config)
    return this.handleResponse(response)
  }

  /**
   * Constrói URL completa combinando base endpoint com endpoint específico
   */
  private buildUrl(endpoint: string): string {
    const cleanBase = this.baseEndpoint.replace(/\/$/, '')
    const cleanEndpoint = endpoint.replace(/^\//, '')
    
    if (!cleanEndpoint) {
      return cleanBase
    }
    
    return `${cleanBase}/${cleanEndpoint}`
  }

  /**
   * Manipula resposta da API extraindo dados ou lançando erro
   */
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.error?.message || 'API request failed')
    }
    
    return response.data
  }

  /**
   * Cria configuração padrão com headers de autenticação
   */
  protected withAuth(config?: RequestConfig): RequestConfig {
    const authToken = this.getAuthToken()
    
    return {
      ...config,
      headers: {
        ...config?.headers,
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    }
  }

  /**
   * Obtém token de autenticação do storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      const authData = localStorage.getItem('pollsia_auth')
      if (!authData) return null
      
      const parsed = JSON.parse(authData)
      return parsed.token || null
    } catch {
      return null
    }
  }

  /**
   * Helper para queries com paginação
   */
  protected buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Helper para cache de requests (implementação básica)
   */
  protected async getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000 // 5 minutos
  ): Promise<T> {
    if (typeof window === 'undefined') {
      return fetcher()
    }

    const cacheKey = `pollsia_cache_${key}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        const isExpired = Date.now() - parsed.timestamp > ttlMs
        
        if (!isExpired) {
          return parsed.data
        }
      } catch {
        // Invalid cache, continue to fetch
      }
    }
    
    const data = await fetcher()
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch {
      // Storage full or not available, ignore
    }
    
    return data
  }

  /**
   * Limpa cache para uma chave específica
   */
  protected clearCache(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`pollsia_cache_${key}`)
    }
  }

  /**
   * Limpa todo o cache do service
   */
  protected clearAllCache(): void {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('pollsia_cache_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }
}