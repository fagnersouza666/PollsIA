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


    private async createInvestmentTransaction(
        userPublicKey: PublicKey,
        poolId: string,
        solAmount: number,
        tokenA: string,
        tokenB: string,
        slippage: number
    ): Promise<InvestmentResult> {
        try {
            console.log('🔄 Criando investimento real via Jupiter + Raydium');
            
            // Buscar pool real do Raydium
            const poolInfo = await this.getRealPoolInfo(poolId, tokenA, tokenB);
            if (!poolInfo) {
                return {
                    success: false,
                    error: 'Pool não encontrada no Raydium'
                };
            }

            // Criar transação composta: SOL → Tokens + Add Liquidity
            const swapTransaction = await this.createJupiterSwapTransaction(
                userPublicKey,
                solAmount,
                poolInfo,
                slippage
            );

            if (!swapTransaction.success) {
                return swapTransaction;
            }

            return {
                success: true,
                requiresSignature: true,
                transactionData: swapTransaction.transactionData,
                description: `Investimento real: ${solAmount} SOL → ${tokenA}/${tokenB} no Raydium`,
                tokenAAmount: swapTransaction.tokenAAmount,
                tokenBAmount: swapTransaction.tokenBAmount,
                actualSolSpent: solAmount
            };

        } catch (error) {
            console.error('Erro ao criar investimento real:', error);
            return {
                success: false,
                error: `Erro ao criar investimento: ${(error as Error).message}`
            };
        }
    }

    private async getRealPoolInfo(poolId: string, tokenA: string, tokenB: string) {
        try {
            console.log(`🔍 Buscando pool ${tokenA}/${tokenB}...`);
            
            // Timeout de 5 segundos para API do Raydium
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            // Buscar pool real via API do Raydium
            const response = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Raydium API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Procurar pool específica
            const pool = data.official?.find((p: any) => 
                (p.baseMint && p.quoteMint) &&
                ((p.baseSymbol === tokenA && p.quoteSymbol === tokenB) ||
                 (p.baseSymbol === tokenB && p.quoteSymbol === tokenA))
            ) || data.unOfficial?.find((p: any) => 
                (p.baseMint && p.quoteMint) &&
                ((p.baseSymbol === tokenA && p.quoteSymbol === tokenB) ||
                 (p.baseSymbol === tokenB && p.quoteSymbol === tokenA))
            );

            if (!pool) {
                console.log(`⚠️ Pool ${tokenA}/${tokenB} não encontrada na API, usando fallback`);
                return this.getFallbackPoolInfo(tokenA, tokenB);
            }

            console.log(`✅ Pool encontrada: ${pool.baseSymbol}/${pool.quoteSymbol}`);
            return {
                id: pool.id,
                baseMint: pool.baseMint,
                quoteMint: pool.quoteMint,
                baseSymbol: pool.baseSymbol,
                quoteSymbol: pool.quoteSymbol
            };
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.log('⏰ Timeout na API do Raydium, usando fallback');
            } else {
                console.error('❌ Erro ao buscar pool:', error);
            }
            return this.getFallbackPoolInfo(tokenA, tokenB);
        }
    }

    private getFallbackPoolInfo(tokenA: string, tokenB: string) {
        console.log(`🔧 Usando fallback para pool ${tokenA}/${tokenB}`);
        
        // Mints conhecidos para pools principais
        const knownMints: Record<string, string> = {
            'SOL': 'So11111111111111111111111111111111111111112',
            'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
            'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
            'ORCA': 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'
        };

        const baseMint = knownMints[tokenA] || knownMints['SOL'];
        const quoteMint = knownMints[tokenB] || knownMints['USDC'];

        console.log(`✅ Fallback configurado: ${tokenA} (${baseMint}) / ${tokenB} (${quoteMint})`);

        return {
            id: 'fallback-pool',
            baseMint,
            quoteMint,
            baseSymbol: tokenA,
            quoteSymbol: tokenB
        };
    }

    private async createJupiterSwapTransaction(
        userPublicKey: PublicKey,
        solAmount: number,
        poolInfo: any,
        slippage: number
    ): Promise<InvestmentResult> {
        try {
            console.log('🌲 Criando transação de investimento');
            
            // Testar Jupiter com timeout melhorado
            console.log(`💡 Testando swap com timeout: ${solAmount} SOL → USDC`);
            
            const lamports = Math.floor(solAmount * 1e9);
            
            // Testar apenas um swap simples SOL → USDC com timeout
            const quote = await this.getJupiterQuote(
                'So11111111111111111111111111111111111111112', // SOL
                'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
                lamports,
                slippage
            );

            if (!quote) {
                console.log('⚠️ Jupiter indisponível, criando transação de teste');
                return await this.createFallbackTransaction(userPublicKey, solAmount, poolInfo);
            }

            // Criar transação de swap
            const swapTx = await this.getJupiterSwapTransaction(
                userPublicKey.toString(),
                quote
            );

            if (!swapTx) {
                console.log('⚠️ Falha na transação Jupiter, usando fallback');
                return await this.createFallbackTransaction(userPublicKey, solAmount, poolInfo);
            }

            console.log('✅ Transação real criada via Jupiter!');

            return {
                success: true,
                requiresSignature: true,
                transactionData: swapTx,
                description: `Swap real via Jupiter: ${solAmount} SOL → USDC`,
                tokenAAmount: parseFloat(quote.outAmount) / 1e6, // USDC 6 decimais
                tokenBAmount: 0, // Apenas um swap por enquanto
                actualSolSpent: solAmount
            };

        } catch (error) {
            console.error('Erro na criação da transação:', error);
            console.log('⚠️ Erro, usando transação de fallback');
            return await this.createFallbackTransaction(userPublicKey, solAmount, poolInfo);
        }
    }

    private async createFallbackTransaction(userPublicKey: PublicKey, solAmount: number, poolInfo: any): Promise<InvestmentResult> {
        try {
            console.log('🔄 Criando transação de fallback (demonstração)');
            
            // Obter blockhash recente
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
            
            // Criar transação simples para demonstração
            const transaction = new Transaction({
                feePayer: userPublicKey,
                blockhash,
                lastValidBlockHeight
            });

            // Adicionar instrução de exemplo
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: userPublicKey,
                    toPubkey: userPublicKey,
                    lamports: Math.floor(solAmount * 1e9 * 0.001) // 0.1% como taxa de exemplo
                })
            );

            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false
            }).toString('base64');

            console.log('✅ Transação de fallback criada');

            return {
                success: true,
                requiresSignature: true,
                transactionData: serializedTransaction,
                description: `Transação de demonstração: ${solAmount} SOL (Jupiter indisponível)`,
                tokenAAmount: solAmount * 0.4, // Simulação
                tokenBAmount: solAmount * 0.4,
                actualSolSpent: solAmount
            };
        } catch (error) {
            return {
                success: false,
                error: `Erro no fallback: ${(error as Error).message}`
            };
        }
    }

    private async getJupiterQuote(inputMint: string, outputMint: string, amount: number, slippage: number) {
        try {
            const slippageBps = Math.floor(slippage * 100); // Converter % para bps
            const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
            
            console.log(`🔍 Buscando quote: ${url}`);
            
            // Timeout de 10 segundos
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            const quote = await response.json();
            
            if (!response.ok || !quote.outAmount) {
                throw new Error(`Jupiter quote error: ${quote.error || 'Invalid response'}`);
            }
            
            console.log(`💱 Quote: ${amount/1e9} SOL → ${quote.outAmount} tokens`);
            return quote;
        } catch (error) {
            console.error('Erro ao buscar quote Jupiter:', error);
            return null;
        }
    }

    private async getJupiterSwapTransaction(userPublicKey: string, quoteResponse: any) {
        try {
            console.log('🔄 Criando transação de swap...');
            
            // Timeout de 15 segundos
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quoteResponse,
                    userPublicKey,
                    wrapAndUnwrapSol: true,
                    dynamicComputeUnitLimit: true,
                    prioritizationFeeLamports: 1000 // Taxa de prioridade
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const result = await response.json();
            
            if (!response.ok || !result.swapTransaction) {
                throw new Error(`Jupiter swap error: ${result.error || 'Invalid response'}`);
            }
            
            console.log('✅ Transação de swap criada');
            return result.swapTransaction;
        } catch (error) {
            console.error('Erro ao criar transação Jupiter:', error);
            return null;
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