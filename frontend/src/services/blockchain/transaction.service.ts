import { PublicKey, SystemProgram, Transaction, VersionedTransaction } from '@solana/web3.js'
import { SolanaService } from './solana.service'

export class TransactionService {
  private solanaService: SolanaService

  constructor() {
    this.solanaService = new SolanaService()
  }

  async createTransferTransaction(
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    lamports: number
  ): Promise<Transaction> {
    const transaction = new Transaction()
    
    const transferInstruction = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    })
    
    transaction.add(transferInstruction)
    
    const { blockhash } = await this.solanaService.getConnection().getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey
    
    return transaction
  }

  async sendAndConfirmTransaction(
    transaction: Transaction | VersionedTransaction
  ): Promise<string> {
    return this.solanaService.sendTransaction(transaction)
  }

  async getTransactionStatus(signature: string) {
    return this.solanaService.getConnection().getSignatureStatus(signature)
  }

  async getTransactionDetails(signature: string) {
    return this.solanaService.getConnection().getTransaction(signature)
  }
}