const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const fullUrl = `${API_BASE_URL}${endpoint}`
    const method = options?.method || 'GET'
    
    // 🔗 Log da URL do serviço chamado
    // eslint-disable-next-line no-console
    console.log(`🔗 API Call: [${method}] ${fullUrl}`)
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(`❌ API Error: [${method}] ${fullUrl} - ${response.status} ${response.statusText}`)
      throw new Error(`API error: ${response.statusText}`)
    }

    // eslint-disable-next-line no-console
    console.log(`✅ API Success: [${method}] ${fullUrl} - ${response.status}`)
    const data = await response.json()
    return data.data
  }

  async discoverPools() {
    return this.request('/pools/discover')
  }

  async getPoolRankings() {
    return this.request('/pools/rankings')
  }

  async analyzePool(poolId: string) {
    return this.request(`/pools/${poolId}/analysis`)
  }

  async connectWallet(publicKey: string, signature: string) {
    return this.request('/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ publicKey, signature }),
    })
  }

  async getPortfolio(publicKey: string) {
    return this.request(`/wallet/${publicKey}/portfolio`)
  }

  async getPositions(publicKey: string) {
    return this.request(`/wallet/${publicKey}/positions`)
  }

  async getWalletPools(publicKey: string, status?: string, sortBy?: string) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (sortBy) params.append('sortBy', sortBy)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/wallet/${publicKey}/pools${query}`)
  }

  async getPerformance(publicKey: string, timeframe?: string) {
    const params = timeframe ? `?timeframe=${timeframe}` : ''
    return this.request(`/analytics/performance/${publicKey}${params}`)
  }

  async getMarketOverview() {
    return this.request('/analytics/market-overview')
  }

  async getOpportunities(riskLevel?: string) {
    const params = riskLevel ? `?riskLevel=${riskLevel}` : ''
    return this.request(`/analytics/opportunities${params}`)
  }
}

export const api = new ApiClient()