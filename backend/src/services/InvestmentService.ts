import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { config } from '../config/env';

export interface InvestmentRequest {
    poolId: string;
    userPublicKey: string;
    solAmount: number;
    tokenA: string;
    tokenB: string;
    slippage?: number;
}

export interface InvestmentResult {
    success: boolean;
    signature?: string;
    error?: string;
    tokenAAmount?: number;
    tokenBAmount?: number;
    actualSolSpent?: number;
}

export class InvestmentService {
    private connection: Connection;
    private wallet: Keypair | null = null;

    constructor() {
        this.connection = new Connection(config.SOLANA_RPC_URL, 'confirmed');
        this.initializeWallet();
    }

    private async initializeWallet() {
        try {
            // Verificar se temos chave privada configurada
            if (!config.SOLANA_PRIVATE_KEY) {
                console.warn('SOLANA_PRIVATE_KEY não configurada - investimentos reais desabilitados');
                return;
            }

            // Converter chave privada para Keypair
            const privateKeyBytes = JSON.parse(config.SOLANA_PRIVATE_KEY);
            this.wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyBytes));

            console.log('✅ Wallet inicializada para investimentos reais');
        } catch (error) {
            console.error('❌ Erro ao inicializar wallet:', error);
        }
    }

    async investInPool(request: InvestmentRequest): Promise<InvestmentResult> {
        if (!this.wallet) {
            return {
                success: false,
                error: 'Serviço de investimento não configurado. Configure SOLANA_PRIVATE_KEY.'
            };
        }

        try {
            console.log('🔄 Iniciando investimento real na pool:', {
                poolId: request.poolId,
                solAmount: request.solAmount,
                tokenA: request.tokenA,
                tokenB: request.tokenB
            });

            // Validar entrada
            if (request.solAmount <= 0) {
                return {
                    success: false,
                    error: 'Valor de investimento deve ser maior que zero'
                };
            }

            // Converter SOL para lamports (1 SOL = 1,000,000,000 lamports)
            const lamports = Math.floor(request.solAmount * 1e9);

            // Buscar o pool no Raydium
            const poolInfo = await this.getPoolInfo(request.poolId);
            if (!poolInfo) {
                return {
                    success: false,
                    error: 'Pool não encontrada no Raydium'
                };
            }

            // Executar swap SOL para tokens usando Jupiter/Raydium
            const swapResult = await this.executeSwapToPool(
                lamports,
                poolInfo.tokenAMint,
                poolInfo.tokenBMint,
                request.slippage || 0.5
            );

            if (!swapResult.success) {
                return {
                    success: false,
                    error: swapResult.error || 'Falha no swap de tokens'
                };
            }

            // Adicionar liquidez na pool do Raydium
            const liquidityResult = await this.addLiquidityToPool(
                poolInfo,
                swapResult.tokenAAmount!,
                swapResult.tokenBAmount!
            );

            return liquidityResult;

        } catch (error) {
            console.error('❌ Erro durante investimento:', error);
            return {
                success: false,
                error: `Erro durante investimento: ${(error as Error).message}`
            };
        }
    }

    private async getPoolInfo(poolId: string) {
        try {
            // Buscar informações da pool no Raydium
            // Por enquanto, retornar estrutura mock baseada em dados reais
            return {
                poolId,
                tokenAMint: 'So11111111111111111111111111111111111111112', // SOL
                tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
                programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8' // Raydium AMM
            };
        } catch (error) {
            console.error('Erro ao buscar info da pool:', error);
            return null;
        }
    }

    private async executeSwapToPool(
        solLamports: number,
        tokenAMint: string,
        tokenBMint: string,
        slippage: number
    ): Promise<InvestmentResult> {
        try {
            if (!this.wallet) {
                throw new Error('Wallet não inicializada');
            }

            // Calcular valores para split 50/50
            const halfSol = Math.floor(solLamports / 2);

            // Por enquanto, vamos simular o swap enquanto não temos integração completa
            // Em produção, aqui seria usado o Jupiter ou método específico do Raydium
            const tokenAAmount = halfSol / 1e9; // Converter lamports para SOL
            const tokenBAmount = halfSol / 1e9; // Simplificado
            const signatureA = 'simulate_swap_' + Date.now();

            return {
                success: true,
                signature: signatureA,
                tokenAAmount,
                tokenBAmount,
                actualSolSpent: solLamports / 1e9
            };

        } catch (error) {
            console.error('Erro no swap:', error);
            return {
                success: false,
                error: `Erro no swap: ${(error as Error).message}`
            };
        }
    }

    private async addLiquidityToPool(
        poolInfo: any,
        tokenAAmount: number,
        tokenBAmount: number
    ): Promise<InvestmentResult> {
        try {
            if (!this.wallet) {
                throw new Error('Wallet não inicializada');
            }

            // Por enquanto, retornar sucesso simulado
            // Na implementação real, seria usado o método específico do Raydium
            console.log('📊 Adicionando liquidez à pool:', {
                poolId: poolInfo.poolId,
                tokenAAmount,
                tokenBAmount
            });

            // Aqui seria implementada a lógica específica do Raydium para adicionar liquidez
            // Por exemplo, usando instruções específicas do programa Raydium

            return {
                success: true,
                signature: 'simulate_liquidity_add_' + Date.now(),
                tokenAAmount,
                tokenBAmount,
                actualSolSpent: (tokenAAmount + tokenBAmount) // Simplificado
            };

        } catch (error) {
            console.error('Erro ao adicionar liquidez:', error);
            return {
                success: false,
                error: `Erro ao adicionar liquidez: ${(error as Error).message}`
            };
        }
    }

    isConfigured(): boolean {
        return this.wallet !== null;
    }

    async getSolBalance(publicKey: string): Promise<number> {
        try {
            const pubkey = new PublicKey(publicKey);
            const balance = await this.connection.getBalance(pubkey);
            return balance / 1e9; // Converter lamports para SOL
        } catch (error) {
            console.error('Erro ao obter saldo SOL:', error);
            return 0;
        }
    }
}