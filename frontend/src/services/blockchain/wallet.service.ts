import { PublicKey } from '@solana/web3.js'
import { SolanaService } from './solana.service'

export class WalletService {
  private solanaService: SolanaService

  constructor() {
    this.solanaService = new SolanaService()
  }

  async getWalletBalance(publicKey: string): Promise<number> {
    const pk = new PublicKey(publicKey)
    return this.solanaService.getBalance(pk)
  }

  async getTokenBalances(publicKey: string) {
    const pk = new PublicKey(publicKey)
    const accounts = await this.solanaService.getTokenAccounts(pk)
    
    return accounts.value.map(account => ({
      mint: account.account.data.parsed.info.mint,
      amount: account.account.data.parsed.info.tokenAmount.uiAmount,
      decimals: account.account.data.parsed.info.tokenAmount.decimals,
    }))
  }

  isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }
}