/**
 * Teste simples para verificar se as dependências estão funcionando
 */

console.log('🧪 Teste simples das dependências...\n');

try {
  // Testar @solana/web3.js
  console.log('1️⃣ Testando @solana/web3.js...');
  const { Connection, PublicKey } = require('@solana/web3.js');
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  console.log('   ✅ @solana/web3.js funcionando');

  // Testar @solana/spl-token
  console.log('2️⃣ Testando @solana/spl-token...');
  const { getAssociatedTokenAddress } = require('@solana/spl-token');
  console.log('   ✅ @solana/spl-token funcionando');

  // Testar BN.js
  console.log('3️⃣ Testando BN.js...');
  const BN = require('bn.js');
  const bn = new BN('100000000');
  console.log('   ✅ BN.js funcionando');

  console.log('\n🎉 Todas as dependências básicas funcionando!');
  console.log('\n📋 Próximos passos:');
  console.log('  1. Implementar Raydium SDK gradualmente');
  console.log('  2. Testar com pools reais em ambiente controlado');
  console.log('  3. Integrar com frontend existente');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}