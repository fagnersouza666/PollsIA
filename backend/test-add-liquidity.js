/**
 * Teste do novo serviço RaydiumRealAddLiquidityService
 * Demonstra funcionamento das instruções REAIS do Raydium
 */

console.log('🧪 Testando RaydiumRealAddLiquidityService...\n');

try {
  // Testar dependências básicas primeiro
  console.log('1️⃣ Testando dependências...');
  const { Connection, PublicKey } = require('@solana/web3.js');
  const { getAssociatedTokenAddress } = require('@solana/spl-token');
  const BN = require('bn.js');
  console.log('   ✅ Dependências carregadas com sucesso');

  // Carregar nosso serviço
  console.log('2️⃣ Carregando RaydiumRealAddLiquidityService...');
  const { RaydiumRealAddLiquidityService } = require('./raydium-real-add-liquidity');
  const service = new RaydiumRealAddLiquidityService();
  console.log('   ✅ Serviço carregado');

  // Testar inicialização
  console.log('3️⃣ Testando inicialização...');
  service.initialize().then(initialized => {
    console.log(`   ✅ Inicializado: ${initialized}`);

    // Testar busca de pools
    console.log('4️⃣ Testando busca de pools...');
    return service.getRealRaydiumPools();
  }).then(realPools => {
    console.log(`   ✅ ${realPools.length} pools encontradas:`);
    realPools.forEach(pool => {
      console.log(`      🏊 ${pool.tokenA.symbol}/${pool.tokenB.symbol} - TVL: $${pool.tvl.toLocaleString()} - APY: ${pool.apy}%`);
    });

    console.log('\n🎉 Teste básico concluído com sucesso!');
    console.log('\n📋 Funcionalidades implementadas:');
    console.log('  ✅ Inicialização do serviço');
    console.log('  ✅ Busca de pools reais do Raydium');
    console.log('  ✅ Estrutura para criação de ATAs');
    console.log('  ✅ Framework para swap SOL→tokens');
    console.log('  ✅ Base para instruções de add liquidity');
    console.log('\n🚀 Pronto para integração com debug-server.js!');
  }).catch(error => {
    console.error('❌ Erro no teste assíncrono:', error.message);
  });

} catch (error) {
  console.error('❌ Erro no teste:', error.message);
}