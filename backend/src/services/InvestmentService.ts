import { Connection, PublicKey, Transaction, SystemProgram, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { config } from '../config/env';

export interface InvestmentRequest {
    poolId: string;
    userPublicKey: string;
    solAmount: number;
    tokenA: string;
    tokenB: string;
    slippage?: number;
}

export interface TransactionRequest {
    transaction: string; // Transação serializada em base64
    description: string;
}

export interface InvestmentResult {
    success: boolean;
    signature?: string;
    error?: string;
    tokenAAmount?: number;
    tokenBAmount?: number;
    actualSolSpent?: number;
    requiresSignature?: boolean;
    transactionData?: string; // Transação serializada para assinatura no frontend
    description?: string;
}

export class InvestmentService {
    private connection: Connection;

    constructor() {
        this.connection = new Connection(config.SOLANA_RPC_URL, 'confirmed');
        console.log('✅ InvestmentService inicializado - usando assinatura via Phantom');
    }

    async investInPool(request: InvestmentRequest): Promise<InvestmentResult> {
        try {
            console.log('🔄 Preparando transação de investimento:', {
                poolId: request.poolId,
                userPublicKey: request.userPublicKey,
                solAmount: request.solAmount,
                tokenA: request.tokenA,
                tokenB: request.tokenB
            });

            // Validar chave pública do usuário
            let userPublicKey: PublicKey;
            try {
                userPublicKey = new PublicKey(request.userPublicKey);
            } catch (error) {
                return {
                    success: false,
                    error: 'Chave pública do usuário inválida'
                };
            }

            // Validar entrada
            if (request.solAmount <= 0) {
                return {
                    success: false,
                    error: 'Valor de investimento deve ser maior que zero'
                };
            }

            // Verificar saldo do usuário
            const balance = await this.getSolBalance(request.userPublicKey);
            if (balance < request.solAmount) {
                return {
                    success: false,
                    error: `Saldo insuficiente. Saldo: ${balance.toFixed(4)} SOL, Necessário: ${request.solAmount} SOL`
                };
            }

            // Criar transação de investimento para assinatura no frontend
            const transactionResult = await this.createInvestmentTransaction(
                userPublicKey,
                request.poolId,
                request.solAmount,
                request.tokenA,
                request.tokenB,
                request.slippage || 0.5
            );

            return transactionResult;

        } catch (error) {
            console.error('❌ Erro durante preparação do investimento:', error);
            return {
                success: false,
                error: `Erro durante preparação: ${(error as Error).message}`
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

    private async createInvestmentTransaction(
        userPublicKey: PublicKey,
        poolId: string,
        solAmount: number,
        tokenA: string,
        tokenB: string,
        slippage: number
    ): Promise<InvestmentResult> {
        try {
            console.log('🔄 Criando transação para assinatura no Phantom');
            
            // Converter SOL para lamports
            const lamports = Math.floor(solAmount * 1e9);
            
            // Obter blockhash recente
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
            
            // Por enquanto, criar uma transação simples de transferência como exemplo
            // Em produção, seria uma instrução complexa do Raydium
            const transaction = new Transaction({
                feePayer: userPublicKey,
                blockhash,
                lastValidBlockHeight
            });

            // Adicionar instrução de exemplo (em produção seria instrução do Raydium)
            // Por enquanto, vamos criar uma transação que precisa ser assinada
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: userPublicKey,
                    toPubkey: userPublicKey, // Auto-transferência como exemplo
                    lamports: 1 // Valor mínimo para teste
                })
            );

            // Serializar transação para envio ao frontend
            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false
            }).toString('base64');

            console.log('✅ Transação criada e serializada para assinatura');

            return {
                success: true,
                requiresSignature: true,
                transactionData: serializedTransaction,
                description: `Investimento de ${solAmount} SOL na pool ${tokenA}/${tokenB}`,
                tokenAAmount: solAmount / 2, // Estimativa
                tokenBAmount: solAmount / 2, // Estimativa
                actualSolSpent: solAmount
            };

        } catch (error) {
            console.error('Erro ao criar transação:', error);
            return {
                success: false,
                error: `Erro ao criar transação: ${(error as Error).message}`
            };
        }
    }

    async processSignedTransaction(signedTransactionData: string): Promise<InvestmentResult> {
        try {
            console.log('🔄 Processando transação assinada');
            
            // Deserializar transação assinada
            const transactionBuffer = Buffer.from(signedTransactionData, 'base64');
            const transaction = Transaction.from(transactionBuffer);
            
            // Enviar transação para a blockchain
            const signature = await this.connection.sendRawTransaction(
                transaction.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                }
            );
            
            console.log('📤 Transação enviada:', signature);
            
            // Aguardar confirmação
            const confirmation = await this.connection.confirmTransaction(
                signature,
                'confirmed'
            );
            
            if (confirmation.value.err) {
                throw new Error(`Transação falhou: ${confirmation.value.err}`);
            }
            
            console.log('✅ Transação confirmada:', signature);
            
            return {
                success: true,
                signature,
                actualSolSpent: 0.001 // Exemplo, em produção seria calculado
            };
            
        } catch (error) {
            console.error('❌ Erro ao processar transação assinada:', error);
            return {
                success: false,
                error: `Erro ao processar transação: ${(error as Error).message}`
            };
        }
    }

    isConfigured(): boolean {
        // Agora o serviço sempre está configurado, pois usa assinatura via Phantom
        return true;
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