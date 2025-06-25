/**
 * 🔍 TESTE MANUAL DAS 5 ESTRATÉGIAS DE DETECÇÃO LP
 * 
 * Este script testa as novas estratégias implementadas para detectar
 * posições de liquidez REAIS na blockchain Solana
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001/api';

// Carteiras de teste (algumas conhecidas por ter LP positions)
const TEST_WALLETS = [
    // Wallet com posições LP conhecidas
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // Raydium team wallet
    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Orca team wallet  
    'DuASG5ubHN6qsBCGJVfLa5G5TjDQ48TJ3XcZ8U6eDee', // Active LP provider
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Another LP provider
];

async function testLPDetection() {
    console.log('🚀 INICIANDO TESTE DAS 5 ESTRATÉGIAS DE DETECÇÃO LP\n');
    console.log('═'.repeat(80));

    for (const wallet of TEST_WALLETS) {
        console.log(`\n🔍 TESTANDO WALLET: ${wallet}`);
        console.log('─'.repeat(60));

        try {
            // 1. Testar detecção de posições LP
            console.log('📍 1. Testando getPositions (5 estratégias)...');
            const positionsResponse = await axios.get(`${BACKEND_URL}/wallet/${wallet}/positions`);
            const positions = positionsResponse.data.data || [];

            console.log(`   ✅ Encontradas ${positions.length} posições LP:`);
            positions.forEach((pos, i) => {
                console.log(`   ${i + 1}. ${pos.tokenA}/${pos.tokenB} - $${pos.value?.toFixed(2) || '0'} (APY: ${pos.apy?.toFixed(1) || '0'}%)`);
            });

            // 2. Testar wallet pools
            console.log('\n📍 2. Testando getWalletPools...');
            const poolsResponse = await axios.get(`${BACKEND_URL}/wallet/${wallet}/pools`);
            const pools = poolsResponse.data.data || [];

            console.log(`   ✅ Encontrados ${pools.length} pools na carteira`);

            // 3. Testar portfolio geral
            console.log('\n📍 3. Testando getPortfolio...');
            const portfolioResponse = await axios.get(`${BACKEND_URL}/wallet/${wallet}/portfolio`);
            const portfolio = portfolioResponse.data.data || {};

            console.log(`   ✅ Portfolio total: $${portfolio.totalValue?.toFixed(2) || '0'}`);
            console.log(`   ✅ Balance SOL: ${portfolio.balance?.toFixed(4) || '0'} SOL`);

        } catch (error) {
            console.log(`   ❌ Erro: ${error.response?.data?.error || error.message}`);
        }

        console.log('─'.repeat(60));
    }

    console.log('\n🎯 RESUMO DAS ESTRATÉGIAS IMPLEMENTADAS:');
    console.log('═'.repeat(80));
    console.log('1. 🔍 ESTRATÉGIA 1: Análise de LP Tokens na Carteira');
    console.log('   - Analisa token accounts buscando LP tokens');
    console.log('   - Verifica metadata e supply baixo');
    console.log('   - Identifica padrões como "TOKEN1-TOKEN2"');

    console.log('\n2. 🔍 ESTRATÉGIA 2: Análise de Transações Recentes');
    console.log('   - Busca transações de addLiquidity/removeLiquidity');
    console.log('   - Identifica instruções de protocolos LP');
    console.log('   - Extrai posições baseadas em histórico');

    console.log('\n3. 🔍 ESTRATÉGIA 3: DexScreener API');
    console.log('   - Consulta API pública do DexScreener');
    console.log('   - Busca pairs associados à carteira');
    console.log('   - Não requer API key');

    console.log('\n4. 🔍 ESTRATÉGIA 4: Birdeye API (RECOMENDADO)');
    console.log('   - API premium com dados precisos');
    console.log('   - Requer BIRDEYE_API_KEY no .env');
    console.log('   - Melhor detecção de posições LP');

    console.log('\n5. 🔍 ESTRATÉGIA 5: Solscan Portfolio API');
    console.log('   - API pública do Solscan');
    console.log('   - Analisa tokens por padrões LP');
    console.log('   - Backup confiável');

    console.log('\n💡 DICAS PARA MELHORAR A DETECÇÃO:');
    console.log('═'.repeat(80));
    console.log('1. Configure BIRDEYE_API_KEY no .env para melhor precisão');
    console.log('2. Configure HELIUS_API_KEY para histórico detalhado');
    console.log('3. Use carteiras com atividade LP recente');
    console.log('4. Algumas posições podem estar em staking ou farming');
    console.log('5. LP tokens podem estar em wallets derivados');
}

// Executar teste
if (require.main === module) {
    testLPDetection().catch(console.error);
}

module.exports = { testLPDetection }; 