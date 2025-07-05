import { BaseService } from '../base.service'

export interface WalletInfo {
  address: string
  solBalance: number
  tokenAccounts: TokenAccount[]
  totalValue: number
  change24h: number
  lastUpdated: string
}

export interface TokenAccount {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  uiAmount: number
  value: number
  logoURI?: string
}

export interface Portfolio {
  totalValue: number
  solBalance: number
  tokenAccounts: number
  change24h: number
  positions: Position[]
}

export interface Position {
  poolId: string
  poolName: string
  tokenA: string
  tokenB: string
  liquidity: number
  value: number
  apy: number
  pnl: number
  pnlPercentage: number
}

export interface Transaction {
  id: string
  type: 'add_liquidity' | 'remove_liquidity' | 'swap' | 'stake' | 'unstake'
  poolId?: string
  amount: number
  tokenA?: string
  tokenB?: string
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  fee: number
}

export class WalletService extends BaseService {
  constructor() {
    super('/api/wallet')
  }

  /**
   * Busca informações da carteira
   */
  async getWalletInfo(address: string): Promise<WalletInfo> {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    return this.getCached(
      `wallet_info_${address}`,
      () => this.get<WalletInfo>(`/${address}`),
      30 * 1000 // Cache por 30 segundos (dados dinâmicos)
    )
  }

  /**
   * Busca portfolio do usuário
   */
  async getPortfolio(address: string): Promise<Portfolio> {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    return this.getCached(
      `portfolio_${address}`,
      () => this.get<Portfolio>(`/${address}/portfolio`),
      1 * 60 * 1000 // Cache por 1 minuto
    )
  }

  /**
   * Busca posições do usuário
   */
  async getPositions(address: string): Promise<Position[]> {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    return this.getCached(
      `positions_${address}`,
      () => this.get<Position[]>(`/${address}/positions`),
      1 * 60 * 1000 // Cache por 1 minuto
    )
  }

  /**
   * Busca histórico de transações
   */
  async getTransactions(
    address: string,
    filters?: {
      type?: Transaction['type']
      limit?: number
      offset?: number
    }
  ): Promise<Transaction[]> {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    const queryParams = this.buildQueryParams({
      type: filters?.type,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0
    })

    return this.get<Transaction[]>(`/${address}/transactions${queryParams}`)
  }

  /**
   * Busca transação específica
   */
  async getTransaction(hash: string): Promise<Transaction> {
    if (!hash) {
      throw new Error('Transaction hash is required')
    }

    return this.get<Transaction>(`/transaction/${hash}`)
  }

  /**
   * Conecta carteira e salva informações (requer autenticação)
   */
  async connectWallet(address: string, signature: string): Promise<{
    token: string
    user: {
      address: string
      connectedAt: string
    }
  }> {
    const result = await this.post<any>('/connect', {
      address,
      signature,
      timestamp: Date.now()
    })

    // Limpar cache relacionado
    this.clearCache(`wallet_info_${address}`)
    this.clearCache(`portfolio_${address}`)

    return result
  }

  /**
   * Desconecta carteira (requer autenticação)
   */
  async disconnectWallet(): Promise<void> {
    await this.post<void>('/disconnect', {}, this.withAuth())
    
    // Limpar todo o cache do wallet
    this.clearAllCache()
  }

  /**
   * Atualiza dados da carteira forçadamente
   */
  async refreshWallet(address: string): Promise<WalletInfo> {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    // Limpar cache para forçar busca nova
    this.clearCache(`wallet_info_${address}`)
    this.clearCache(`portfolio_${address}`)
    this.clearCache(`positions_${address}`)

    return this.getWalletInfo(address)
  }

  /**
   * Busca tokens disponíveis na carteira para swap
   */
  async getAvailableTokens(address: string): Promise<TokenAccount[]> {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    return this.getCached(
      `available_tokens_${address}`,
      () => this.get<TokenAccount[]>(`/${address}/tokens`),
      2 * 60 * 1000 // Cache por 2 minutos
    )
  }

  /**
   * Estima taxas para uma transação
   */
  async estimateFees(params: {
    type: 'swap' | 'add_liquidity' | 'remove_liquidity'
    fromToken?: string
    toToken?: string
    amount?: number
    poolId?: string
  }): Promise<{
    networkFee: number
    protocolFee: number
    totalFee: number
    estimatedGas: number
  }> {
    return this.post<any>('/estimate-fees', params)
  }

  /**
   * Valida se um endereço de carteira é válido
   */
  async validateAddress(address: string): Promise<{
    isValid: boolean
    network: 'mainnet' | 'devnet' | 'testnet'
    type: 'wallet' | 'program' | 'token'
  }> {
    return this.get<any>(`/validate/${address}`)
  }

  /**
   * Busca preços atuais dos tokens na carteira
   */
  async getTokenPrices(addresses: string[]): Promise<Record<string, {
    price: number
    change24h: number
    volume24h: number
  }>> {
    return this.post<any>('/token-prices', { addresses })
  }
}