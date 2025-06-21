import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { config } from '../config/env';
import axios from 'axios';

interface TokenBalance {
  symbol: string;
  balance: number;
  value: number;
  mint: string;
}

interface TokenPrice {
  [mint: string]: number;
}

export class WalletService {
  private connection: Connection;
  private tokenPrices: TokenPrice = {};

  constructor() {
    this.connection = new Connection(config.SOLANA_RPC_URL);
  }

  async connectWallet(publicKey: string, signature: string) {
    try {
      const pubkey = new PublicKey(publicKey);
      
      // Verify the wallet exists on Solana
      const accountInfo = await this.connection.getAccountInfo(pubkey);
      if (!accountInfo) {
        throw new Error('Wallet not found on Solana network');
      }
      
      // Get actual balance
      const balance = await this.getBalance(publicKey);
      
      return {
        publicKey,
        connected: true,
        balance
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async getPortfolio(publicKey: string) {
    try {
      const pubkey = new PublicKey(publicKey);
      
      // Get all token accounts for this wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubkey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Get current token prices
      await this.updateTokenPrices();

      // Process token balances
      const tokens: TokenBalance[] = [];
      let totalValue = 0;

      // Add SOL balance
      const solBalance = await this.getBalance(publicKey);
      const solPrice = this.tokenPrices['sol'] || 0;
      const solValue = solBalance * solPrice;
      
      tokens.push({
        symbol: 'SOL',
        balance: solBalance,
        value: solValue,
        mint: 'So11111111111111111111111111111111111111112'
      });
      totalValue += solValue;

      // Add token balances
      for (const account of tokenAccounts.value) {
        const tokenData = account.account.data.parsed.info;
        const mint = tokenData.mint;
        const balance = tokenData.tokenAmount.uiAmount || 0;
        
        if (balance > 0) {
          const symbol = this.getTokenSymbol(mint);
          const price = this.tokenPrices[mint] || 0;
          const value = balance * price;
          
          tokens.push({
            symbol,
            balance,
            value,
            mint
          });
          totalValue += value;
        }
      }

      // Get LP positions (simplified - would need to check specific LP token programs)
      const positions = await this.getLPPositions(publicKey);

      return {
        totalValue: Number(totalValue.toFixed(2)),
        tokens: tokens.filter(t => t.value > 0.01), // Filter dust
        positions
      };
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return {
        totalValue: 0,
        tokens: [],
        positions: []
      };
    }
  }

  async getPositions(publicKey: string) {
    return this.getLPPositions(publicKey);
  }

  private async getLPPositions(publicKey: string) {
    try {
      // This is a simplified implementation
      // In reality, you'd need to check specific LP token programs like Raydium's
      // and parse the LP token accounts to get position details
      
      const pubkey = new PublicKey(publicKey);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubkey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const positions = [];
      
      // Look for LP tokens (this is a simplified check)
      for (const account of tokenAccounts.value) {
        const tokenData = account.account.data.parsed.info;
        const mint = tokenData.mint;
        const balance = tokenData.tokenAmount.uiAmount || 0;
        
        // Check if this could be an LP token (simplified heuristic)
        if (balance > 0 && this.couldBeLPToken(mint)) {
          // This would need real LP position data from the protocol
          // For now, return empty array
        }
      }

      return positions;
    } catch (error) {
      console.error('Error getting LP positions:', error);
      return [];
    }
  }

  private couldBeLPToken(mint: string): boolean {
    // Simple heuristic - LP tokens often have specific patterns
    // This would need to be replaced with actual LP token registry
    return false; // Simplified for now
  }

  private async updateTokenPrices() {
    try {
      // Get token prices from CoinGecko or Jupiter API
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'solana,usd-coin,raydium',
          vs_currencies: 'usd'
        }
      });

      this.tokenPrices = {
        'sol': response.data.solana?.usd || 0,
        'So11111111111111111111111111111111111111112': response.data.solana?.usd || 0,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': response.data['usd-coin']?.usd || 1, // USDC
        '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': response.data.raydium?.usd || 0, // RAY
      };
    } catch (error) {
      console.error('Error fetching token prices:', error);
      // Use fallback prices
      this.tokenPrices = {
        'sol': 100, // Fallback SOL price
        'So11111111111111111111111111111111111111112': 100,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC stable
        '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 1, // RAY fallback
      };
    }
  }

  private getTokenSymbol(mint: string): string {
    const tokenMap: Record<string, string> = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
    };
    
    return tokenMap[mint] || mint.substring(0, 6) + '...';
  }

  private async getBalance(publicKey: string) {
    const pubkey = new PublicKey(publicKey);
    const balance = await this.connection.getBalance(pubkey);
    return balance / 1e9; // Convert lamports to SOL
  }
}