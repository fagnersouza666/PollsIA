#!/usr/bin/env node

// Teste de investimento real via Jupiter + Raydium
async function testRealInvestment() {
    try {
        console.log('🧪 Testando investimento real via Jupiter...\n');

        // 1. Verificar status do serviço
        console.log('1️⃣ Verificando status do serviço...');
        const statusResponse = await fetch('http://localhost:3001/api/investment/status');
        const status = await statusResponse.json();
        console.log('Status:', status.message);

        if (!status.configured) {
            throw new Error('Serviço não configurado');
        }

        // 2. Preparar investimento real
        console.log('\n2️⃣ Preparando investimento SOL/USDC...');
        const investmentData = {
            poolId: 'real-pool-sol-usdc',
            userPublicKey: 'DuASG5ubHN6qsBCGJVfLa5G5TjDQ48TJ3XcZ8U6eDee', // Chave de teste
            solAmount: 0.01, // Valor pequeno para teste
            tokenA: 'SOL',
            tokenB: 'USDC',
            slippage: 0.5
        };

        console.log('Dados do investimento:', investmentData);

        // 3. Executar preparação da transação
        console.log('\n3️⃣ Executando preparação da transação...');
        const response = await fetch('http://localhost:3001/api/investment/invest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(investmentData),
        });

        const result = await response.json();
        
        console.log('\n📋 Resultado:');
        console.log('Success:', result.success);
        
        if (result.success) {
            console.log('Requires Signature:', result.requiresSignature);
            console.log('Description:', result.data.description);
            console.log('Token A Amount:', result.data.tokenAAmount);
            console.log('Token B Amount:', result.data.tokenBAmount);
            console.log('Transaction Data Length:', result.data.transactionData?.length || 0);
            
            if (result.data.transactionData) {
                console.log('\n✅ Transação real criada com sucesso!');
                console.log('🔗 A transação contém instruções reais do Jupiter para swap SOL → Tokens');
                console.log('💡 Para executar: assine via Phantom e envie para /api/investment/process-signed');
            }
        } else {
            console.log('❌ Erro:', result.error);
        }

        console.log('\n🎉 Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar teste
testRealInvestment();