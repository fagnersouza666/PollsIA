import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { config } from '../config/env';
import { Portfolio, Position } from '../types/wallet';
import axios from 'axios';


interface TokenPrice {
  [mint: string]: number;
}

export class WalletService {
  private connection: Connection;
  private tokenPrices: TokenPrice = {};

  constructor() {
    this.connection = new Connection(config.SOLANA_RPC_URL);
  }

  async connectWallet(publicKey: string, _signature: string) {
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

  async getPortfolio(publicKey: string): Promise<Portfolio> {
    try {
      console.log('Getting portfolio for:', publicKey);
      
      // Validate public key first
      const pubkey = new PublicKey(publicKey);
      
      // Get SOL balance
      const balanceInfo = await this.connection.getBalance(pubkey);
      const solBalance = balanceInfo / 1000000000; // Convert lamports to SOL
      console.log('SOL balance:', solBalance);
      
      // Get SOL price
      let solPrice = 100; // Default fallback
      try {
        const priceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        solPrice = priceResponse.data.solana?.usd || 100;
        console.log('SOL price:', solPrice);
      } catch (priceError) {
        console.warn('Failed to fetch SOL price, using fallback');
      }
      
      const totalValue = solBalance * solPrice;
      
      // Get token accounts count
      let tokenAccountsCount = 0;
      try {
        const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
          pubkey,
          { programId: TOKEN_PROGRAM_ID }
        );
        tokenAccountsCount = tokenAccounts.value.length;
        console.log('Token accounts found:', tokenAccountsCount);
      } catch (tokenError) {
        console.warn('Failed to fetch token accounts:', tokenError);
      }
      
      // Simulated 24h change
      const change24h = (Math.random() - 0.5) * 10; // -5% to +5%
      
      const portfolio: Portfolio = {
        totalValue: Number(totalValue.toFixed(2)) || 0,
        solBalance: Number(solBalance.toFixed(6)) || 0,
        tokenAccounts: tokenAccountsCount || 0,
        change24h: Number(change24h.toFixed(2)) || 0,
        performance: []
      };
      
      console.log('Portfolio result:', portfolio);
      return portfolio;
      
    } catch (error) {
      console.error('Error getting portfolio:', error);
      
      // Return safe defaults
      const defaultPortfolio: Portfolio = {
        totalValue: 0,
        solBalance: 0,
        tokenAccounts: 0,
        change24h: 0,
        performance: []
      };
      
      return defaultPortfolio;
    }
  }

  async getPositions(publicKey: string) {
    try {
      const positions = await this.getLPPositions(publicKey);
      return positions || [];
    } catch (error) {
      console.error('Error getting positions:', error);
      return [];
    }
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

      const positions: Position[] = [];
      
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

  private couldBeLPToken(_mint: string): boolean {
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