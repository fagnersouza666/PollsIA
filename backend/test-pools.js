const { Connection, PublicKey } = require('@solana/web3.js');

// Test pools detection with a known wallet that has LP tokens
async function testPoolsDetection() {
  console.log('🧪 Testing pools detection...');
  
  // Use a wallet that is known to have LP tokens
  // For testing, we'll use a random wallet - in production you'd use the actual connected wallet
  const testWallet = 'So11111111111111111111111111111111111111112'; // SOL mint as test
  
  try {
    // Test positions endpoint
    console.log('\n🎯 Testing positions endpoint...');
    const positionsResponse = await fetch(`http://localhost:3001/api/wallet/${testWallet}/positions`);
    const positionsData = await positionsResponse.json();
    
    console.log('Positions Response:', JSON.stringify(positionsData, null, 2));
    
    // Test pools endpoint
    console.log('\n🏊 Testing pools endpoint...');
    const poolsResponse = await fetch(`http://localhost:3001/api/wallet/${testWallet}/pools`);
    const poolsData = await poolsResponse.json();
    
    console.log('Pools Response:', JSON.stringify(poolsData, null, 2));
    
    // Test Raydium pairs endpoint
    console.log('\n🔗 Testing Raydium pairs endpoint...');
    const pairsResponse = await fetch('http://localhost:3001/raydium-pairs');
    const pairsData = await pairsResponse.json();
    
    console.log(`Found ${pairsData.length} Raydium pairs`);
    console.log('First few pairs:', pairsData.slice(0, 3).map(p => ({ name: p.name, lpMint: p.lpMint })));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPoolsDetection();