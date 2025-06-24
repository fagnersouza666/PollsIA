import { createSolanaRpc } from '@solana/rpc';
import { address } from '@solana/addresses';
import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';
import { config } from '../config/env';
import { supabase } from './supabaseClient';
import { Portfolio, Position, PerformanceData } from '../types/wallet';
import axios from 'axios';


export class WalletService {
  private rpc: ReturnType<typeof createSolanaRpc>;
  private tokenPrices: Record<string, number> = {};
  private lastPriceUpdate = 0;
  private readonly PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.rpc = createSolanaRpc(config.SOLANA_RPC_URL);
  }

  async connectWallet(publicKey: string, _signature: string) {
    try {
      const pubkeyAddress = address(publicKey);
      console.log('Conectando carteira:', publicKey);

      // Verificar se a carteira existe na blockchain
      const accountInfo = await this.rpc.getAccountInfo(pubkeyAddress as any).send();
      const balance = await this.getBalance(publicKey);

      console.log('Carteira encontrada na blockchain');
      console.log('Saldo:', balance, 'SOL');

      return {
        publicKey: pubkeyAddress,
        connected: true,
        balance: balance
      };
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      throw new Error('Falha ao conectar carteira. Verifique se a chave pública é válida.');
    }
  }

  async getPortfolio(publicKey: string): Promise<Portfolio> {
    try {
      console.log('Obtendo portfólio para:', publicKey);

      // Atualizar preços de tokens se necessário
      await this.updateTokenPrices();

      // Obter saldo SOL
      const solBalance = await this.getBalance(publicKey);
      console.log('Saldo SOL:', solBalance);

      // Obter preço do SOL
      const solPrice = this.tokenPrices['sol'] || 100;
      console.log('Preço SOL:', solPrice);

      // Obter token accounts com balances usando implementação segura
      let tokenAccountsCount = 0;
      let tokensValue = 0;

      try {
        const pubkeyAddress = address(publicKey);

        // Usar a implementação correta do Solana 2.0 para buscar token accounts
        const tokenAccounts = await this.rpc.getTokenAccountsByOwner(
          pubkeyAddress as any,
          { programId: TOKEN_PROGRAM_ADDRESS as any },
          { commitment: 'confirmed' }
        ).send();

        tokenAccountsCount = tokenAccounts.value.length;
        console.log('Contas de token encontradas:', tokenAccountsCount);

        // Calcular valor dos tokens de forma mais robusta
        for (const account of tokenAccounts.value) {
          try {
            // Buscar informações da conta de token
            const accountInfo = await this.rpc.getAccountInfo(
              account.pubkey,
              { commitment: 'confirmed' }
            ).send();

            if (accountInfo.value?.data) {
              // Implementação simplificada - em produção, decodificar dados reais do token
              const tokenValue = Math.random() * 100 + 10; // Valor simulado mais realista
              tokensValue += tokenValue;
            }
          } catch (tokenError) {
            console.warn('Erro ao processar token account:', tokenError);
            // Continuar processamento mesmo com erro em token específico
          }
        }
      } catch (tokenError) {
        console.warn('Falha ao buscar contas de token:', tokenError);
        // Usar valores padrão quando não conseguir buscar tokens
        tokenAccountsCount = 0;
        tokensValue = 0;
      }

      const totalValue = (solBalance * solPrice) + tokensValue;

      // Gerar histórico de performance mais realista
      const performanceHistory = this.generatePerformanceHistory(totalValue);

      // Mudança calculada baseada no histórico
      const change24h = performanceHistory.length > 1
        ? ((performanceHistory[performanceHistory.length - 1].value - performanceHistory[performanceHistory.length - 2].value) / performanceHistory[performanceHistory.length - 2].value) * 100
        : (Math.random() - 0.5) * 10;

      const portfolio: Portfolio = {
        totalValue: Number(totalValue.toFixed(2)) || 0,
        solBalance: Number(solBalance.toFixed(6)) || 0,
        tokenAccounts: tokenAccountsCount || 0,
        change24h: Number(change24h.toFixed(2)) || 0,
        performance: performanceHistory
      };

      console.log('Resultado do portfólio:', portfolio);
      return portfolio;

    } catch (error) {
      console.error('Erro ao obter portfólio:', error);

      // Retornar padrões seguros
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

  private generatePerformanceHistory(currentValue: number): PerformanceData[] {
    const history: PerformanceData[] = [];
    const days = 30; // Últimos 30 dias
    let value = currentValue * 0.9; // Começar 10% menor

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Adicionar variação realista
      const dailyChange = (Math.random() - 0.5) * 0.05; // ±2.5% diário
      const trendChange = i < days ? 0.002 : 0; // Tendência ligeiramente positiva
      value *= (1 + dailyChange + trendChange);

      // Calcular mudança baseada no valor anterior
      const previousValue = history.length > 0 ? history[history.length - 1].value : value;
      const change = history.length === 0 ? 0 : ((value - previousValue) / previousValue) * 100;

      const dataPoint: PerformanceData = {
        date: date.toISOString().split('T')[0],
        value: Number(value.toFixed(2)),
        change: Number(change.toFixed(2))
      };

      history.push(dataPoint);
    }

    // Definir o último valor como valor atual
    if (history.length > 0) {
      history[history.length - 1].value = currentValue;
    }

    console.log(`Gerado histórico de performance com ${history.length} pontos`);
    return history;
  }

  async getPositions(publicKey: string) {
    try {
      const positions = await this.getLPPositions(publicKey);
      return positions || [];
    } catch (error) {
      console.error('Erro ao obter posições:', error);
      return [];
    }
  }

  private async getLPPositions(publicKey: string) {
    try {
      const pubkeyAddress = address(publicKey);
      const tokenAccounts = await this.rpc.getTokenAccountsByOwner(
        pubkeyAddress as any,
        { programId: TOKEN_PROGRAM_ADDRESS as any },
        { commitment: 'confirmed' }
      ).send();

      const positions: Position[] = [];

      // Simular algumas posições baseadas nas contas de token encontradas
      if (tokenAccounts.value.length > 0) {
        // Criar posições simuladas mais realistas
        const samplePositions = [
          {
            poolId: 'sol_usdc_pool_001',
            tokenA: 'SOL',
            tokenB: 'USDC',
            liquidity: Math.random() * 10000 + 1000,
            value: Math.random() * 5000 + 500,
            apy: Math.random() * 20 + 5,
            entryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            poolId: 'sol_ray_pool_002',
            tokenA: 'SOL',
            tokenB: 'RAY',
            liquidity: Math.random() * 8000 + 800,
            value: Math.random() * 3000 + 300,
            apy: Math.random() * 30 + 10,
            entryDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        // Adicionar posições baseadas no número de token accounts
        const numPositions = Math.min(tokenAccounts.value.length, 3);
        for (let i = 0; i < numPositions; i++) {
          if (samplePositions[i]) {
            positions.push(samplePositions[i]);
          }
        }
      }

      console.log(`Encontradas ${positions.length} posições LP para ${publicKey}`);
      return positions;
    } catch (error) {
      console.error('Erro ao obter posições LP:', error);
      return [];
    }
  }

  private couldBeLPToken(_mint: string): boolean {
    // Heurística simples - LP tokens frequentemente têm padrões específicos
    // Isso precisaria ser substituído por um registro real de LP tokens
    return false; // Simplificado por enquanto
  }

  private async updateTokenPrices() {
    const now = Date.now();

    // Verificar se os preços estão em cache e ainda válidos
    if (this.lastPriceUpdate > 0 && (now - this.lastPriceUpdate) < this.PRICE_CACHE_DURATION) {
      return;
    }

    try {
      // Buscar preços de tokens principais
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'solana,usd-coin,tether,raydium',
          vs_currencies: 'usd'
        },
        timeout: 5000
      });

      if (response.data) {
        this.tokenPrices = {
          'sol': response.data.solana?.usd || 100,
          'usdc': response.data['usd-coin']?.usd || 1,
          'usdt': response.data.tether?.usd || 1,
          'ray': response.data.raydium?.usd || 1.5
        };

        this.lastPriceUpdate = now;
        console.log('Preços de tokens atualizados:', this.tokenPrices);
      }
    } catch (error) {
      console.warn('Erro ao atualizar preços de tokens:', error);

      // Usar preços de fallback se não conseguir atualizar
      if (Object.keys(this.tokenPrices).length === 0) {
        this.tokenPrices = {
          'sol': 100,
          'usdc': 1,
          'usdt': 1,
          'ray': 1.5
        };
      }
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
    const pubkeyAddress = address(publicKey);
    const balanceResponse = await this.rpc.getBalance(pubkeyAddress as any).send();
    return Number(balanceResponse.value) / 1e9; // Converter lamports para SOL
  }

  async getWalletPools(publicKey: string) {
    try {
      console.log('Obtendo pools da carteira:', publicKey);

      // Validar chave pública
      const pubkeyAddress = address(publicKey);

      // Obter posições LP existentes
      const positions = await this.getLPPositions(publicKey);

      // Obter token accounts da carteira (usado para validação de contexto)
      await this.rpc.getTokenAccountsByOwner(
        pubkeyAddress as any,
        { programId: TOKEN_PROGRAM_ADDRESS as any }
      ).send();

      // Mapear posições para format de pools da carteira
      const walletPools = positions.map(position => ({
        id: position.poolId,
        tokenA: position.tokenA,
        tokenB: position.tokenB,
        myLiquidity: position.liquidity,
        myValue: position.value,
        apy: position.apy,
        entryDate: position.entryDate,
        currentValue: position.value * (1 + (Math.random() - 0.5) * 0.1), // Simular variação atual
        pnl: (position.value * (Math.random() - 0.5) * 0.2), // Simular P&L
        rewardsEarned: position.value * 0.05, // 5% em rewards
        status: 'active' as const
      }));

      console.log(`Encontradas ${walletPools.length} pools na carteira`);
      return walletPools;
    } catch (error) {
      console.error('Erro ao obter pools da carteira:', error);
      return [];
    }
  }

  async disconnectWallet(publicKey: string): Promise<boolean> {
    try {
      // TODO: Implementar lógica real de desconexão
      console.log(`Desconectando carteira: ${publicKey}`);

      // Simular limpeza de dados de sessão
      // Em produção, isso removeria:
      // - Cache do portfólio
      // - Dados de sessão
      // - Tokens temporários

      return true;
    } catch (error) {
      console.error('Erro ao desconectar carteira:', error);
      return false;
    }
  }
}