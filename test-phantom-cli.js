#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 PollsIA - Diagnóstico CLI do Sistema');
console.log('=====================================\n');

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

// Testes do sistema
async function runDiagnostics() {
    console.log('1️⃣ Testando Backend Health...');
    try {
        const health = await makeRequest('http://127.0.0.1:3001/health');
        if (health.status === 200) {
            console.log('✅ Backend OK:', health.data);
        } else {
            console.log('❌ Backend com problema:', health.status);
        }
    } catch (error) {
        console.log('❌ Backend não acessível:', error.message);
        return;
    }

    console.log('\n2️⃣ Testando API de Pools...');
    try {
        const pools = await makeRequest('http://127.0.0.1:3001/api/pools');
        console.log('✅ Pools API OK. Total de pools:', pools.data?.length || 'N/A');
    } catch (error) {
        console.log('❌ Pools API erro:', error.message);
    }

    console.log('\n3️⃣ Testando API de Analytics...');
    try {
        const analytics = await makeRequest('http://127.0.0.1:3001/api/analytics/overview');
        console.log('✅ Analytics API OK:', Object.keys(analytics.data || {}));
    } catch (error) {
        console.log('❌ Analytics API erro:', error.message);
    }

    console.log('\n4️⃣ Testando criação de transação de investimento...');
    try {
        const investment = await makeRequest('http://127.0.0.1:3001/api/investment/invest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                poolId: 'test-pool-id',
                userPublicKey: '11111111111111111111111111111112',
                solAmount: 0.01,
                tokenA: 'SOL',
                tokenB: 'USDC'
            }
        });

        if (investment.status === 200 && investment.data.success) {
            console.log('✅ Investment API OK - Transação criada');
            console.log('   - Requires signature:', investment.data.requiresSignature);
            console.log('   - Pool ID:', investment.data.data?.poolId);
            console.log('   - Message:', investment.data.message);
        } else {
            console.log('❌ Investment API problema:', investment.data);
        }
    } catch (error) {
        console.log('❌ Investment API erro:', error.message);
    }

    console.log('\n5️⃣ Testando APIs externas (Helius)...');
    try {
        const wallet = await makeRequest('http://127.0.0.1:3001/api/wallet/11111111111111111111111111111112/tokens');
        console.log('✅ Wallet API OK. Tokens encontrados:', wallet.data?.tokens?.length || 0);
    } catch (error) {
        console.log('❌ Wallet API erro:', error.message);
    }

    console.log('\n📋 RESUMO DO DIAGNÓSTICO');
    console.log('========================');
    console.log('✅ Se todos os testes acima passaram, o problema está no frontend/Phantom');
    console.log('❌ Se algum teste falhou, o problema está no backend/APIs');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Verifique se o Phantom está instalado e ativo');
    console.log('2. Teste em modo incógnito');
    console.log('3. Desabilite popup blocker');
    console.log('4. Abra o console do navegador (F12) para ver erros JavaScript');
}

// Executar diagnósticos
runDiagnostics().catch(console.error); 