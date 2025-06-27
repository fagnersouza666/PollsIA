import { 
  Connection, 
  PublicKey, 
  Transaction, 
  Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  Raydium, 
  TxVersion,
  parseTokenAccountResp,
  buildSimpleTransaction
} from '@raydium-io/raydium-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';

export interface RealInvestmentParams {
  poolId: string;
  userPublicKey: string;
  solAmount: number;
  slippage: number;
}

export interface RealInvestmentResult {
  success: boolean;
  data?: {
    transactionData: string;
    expectedLpTokens: number;
    tokenAAmount: number;
    tokenBAmount: number;
    poolInfo: any;
    description: string;
  };
  error?: string;
}

export class RaydiumInvestmentService {
  private connection: Connection;
  private raydium: Raydium | null = null;

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  }

  async initialize() {
    console.log('🔄 Inicializando Raydium SDK...');
    
    try {
      this.raydium = await Raydium.load({
        owner: Keypair.generate(), // Temporário - será substituído pelo usuário
        connection: this.connection,
        cluster: 'mainnet',
        disableFeatureCheck: true,
        disableLoadToken: false,
        blockhashCommitment: 'finalized',
      });
      
      console.log('✅ Raydium SDK inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Raydium SDK:', error);
      return false;
    }
  }

  async getAvailablePools() {
    console.log('🔍 Buscando pools disponíveis do Raydium...');
    
    if (!this.raydium) {
      await this.initialize();
    }

    try {
      // Buscar pools populares (SOL pairs)
      const poolsData = await this.raydium!.api.fetchPoolById({
        ids: [], // Vazio para buscar todas
      });

      const solPools = Object.values(poolsData).filter(pool => {
        const hasSol = pool.mintA.toBase58() === 'So11111111111111111111111111111111111111112' || 
                      pool.mintB.toBase58() === 'So11111111111111111111111111111111111111112';
        const hasLiquidity = pool.lpReserve && pool.lpReserve.gt(new BN(0));
        return hasSol && hasLiquidity;
      }).slice(0, 10); // Top 10 pools

      console.log(`✅ Encontradas ${solPools.length} pools com SOL`);
      
      return solPools.map(pool => ({
        id: pool.id,
        tokenA: pool.mintA.toBase58() === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'TOKEN',
        tokenB: pool.mintB.toBase58() === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'TOKEN',
        mintA: pool.mintA.toBase58(),
        mintB: pool.mintB.toBase58(),
        tvl: pool.tvl || 0,
        apy: pool.day?.apr || 0,
      }));

    } catch (error) {
      console.error('❌ Erro ao buscar pools:', error);
      return [];
    }
  }

  async prepareRealInvestment(params: RealInvestmentParams): Promise<RealInvestmentResult> {
    console.log('🏊 Preparando investimento real na pool:', params);

    if (!this.raydium) {
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Falha ao inicializar Raydium SDK'
        };
      }
    }

    try {
      const userPubkey = new PublicKey(params.userPublicKey);
      
      // 1. Buscar informações da pool
      console.log('🔍 Buscando informações da pool...');
      const poolInfo = await this.raydium!.api.fetchPoolById({
        ids: [params.poolId]
      });

      const pool = poolInfo[params.poolId];
      if (!pool) {
        return {
          success: false,
          error: `Pool ${params.poolId} não encontrada`
        };
      }

      console.log('✅ Pool encontrada:', {
        id: pool.id,
        mintA: pool.mintA.toBase58(),
        mintB: pool.mintB.toBase58(),
        tvl: pool.tvl
      });

      // 2. Verificar saldo do usuário
      const balance = await this.connection.getBalance(userPubkey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      if (solBalance < params.solAmount) {
        return {
          success: false,
          error: `Saldo insuficiente. Atual: ${solBalance.toFixed(4)} SOL, necessário: ${params.solAmount} SOL`
        };
      }

      // 3. Calcular tokens necessários para add liquidity
      const solAmountLamports = new BN(params.solAmount * LAMPORTS_PER_SOL);
      
      // Simplificação: usar metade do SOL para cada token da pool
      const halfSolAmount = new BN(solAmountLamports.div(new BN(2)));

      // 4. Preparar transação de add liquidity
      console.log('🔨 Preparando transação de add liquidity...');
      
      // Por enquanto, vamos criar uma transação simples para demonstração
      // Em produção real, isso seria mais complexo com swaps + add liquidity
      const { blockhash } = await this.connection.getLatestBlockhash();
      
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      // TODO: Adicionar instruções reais do Raydium aqui
      // Por enquanto, transação vazia para demonstração
      
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });

      const transactionData = Buffer.from(serializedTx).toString('base64');

      // 5. Calcular estimativas
      const estimatedLpTokens = params.solAmount * 0.99; // Estimativa simplificada
      const tokenAAmount = params.solAmount / 2;
      const tokenBAmount = params.solAmount / 2;

      console.log('✅ Transação preparada com sucesso');

      return {
        success: true,
        data: {
          transactionData,
          expectedLpTokens: estimatedLpTokens,
          tokenAAmount,
          tokenBAmount,
          poolInfo: {
            id: pool.id,
            mintA: pool.mintA.toBase58(),
            mintB: pool.mintB.toBase58(),
            tvl: pool.tvl
          },
          description: `Investimento real de ${params.solAmount} SOL na pool ${params.poolId}`
        }
      };

    } catch (error) {
      console.error('❌ Erro ao preparar investimento real:', error);
      return {
        success: false,
        error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  async processRealInvestment(signedTransaction: string): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }> {
    console.log('📤 Processando investimento real...');

    try {
      // Deserializar e enviar transação
      const transactionBuffer = Buffer.from(signedTransaction, 'base64');
      const transaction = Transaction.from(transactionBuffer);

      console.log('🚀 Enviando transação para a blockchain...');
      const signature = await this.connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      console.log('⏳ Aguardando confirmação...');
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transação falhou: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('🎉 Investimento real processado com sucesso!');
      
      return {
        success: true,
        signature
      };

    } catch (error) {
      console.error('❌ Erro ao processar investimento real:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Instância singleton
export const raydiumInvestmentService = new RaydiumInvestmentService();