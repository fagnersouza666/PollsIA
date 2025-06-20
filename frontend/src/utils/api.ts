const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

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
    return this.request(`/wallet/portfolio/${publicKey}`)
  }

  async getPositions(publicKey: string) {
    return this.request(`/wallet/positions/${publicKey}`)
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