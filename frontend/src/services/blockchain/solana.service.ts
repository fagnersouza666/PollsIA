import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { SOLANA_RPC_URL } from '@/lib/constants'

export class SolanaService {
  private connection: Connection

  constructor(rpcUrl: string = SOLANA_RPC_URL) {
    this.connection = new Connection(rpcUrl, 'confirmed')
  }

  getConnection(): Connection {
    return this.connection
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey)
    return balance / 1e9 // Convert lamports to SOL
  }

  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    signers?: any[]
  ): Promise<string> {
    const signature = await this.connection.sendRawTransaction(
      transaction.serialize()
    )
    
    await this.connection.confirmTransaction(signature, 'confirmed')
    return signature
  }

  async getRecentBlockhash(): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash()
    return blockhash
  }

  async getAccountInfo(publicKey: PublicKey) {
    return this.connection.getAccountInfo(publicKey)
  }

  async getTokenAccounts(walletPublicKey: PublicKey) {
    return this.connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })
  }
}