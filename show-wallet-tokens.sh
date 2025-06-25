#!/bin/bash

# 🔍 Script para exibir TODOS os tokens de uma carteira Solana
# Uso: ./show-wallet-tokens.sh <WALLET_ADDRESS>

if [ $# -eq 0 ]; then
    echo "🚀 EXIBIR TODOS OS TOKENS DA CARTEIRA"
    echo "════════════════════════════════════"
    echo ""
    echo "📝 Uso: ./show-wallet-tokens.sh <WALLET_ADDRESS>"
    echo ""
    echo "📍 Exemplos de carteiras para testar:"
    echo "   • 4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R (Raydium)"
    echo "   • 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM (Orca)"
    echo "   • DuASG5ubHN6qsBCGJVfLa5G5TjDQ48TJ3XcZ8U6eDee (LP Provider)"
    echo ""
    echo "💡 Cole o endereço da SUA carteira para ver seus tokens!"
    exit 1
fi

WALLET=$1
API_URL="http://localhost:3001/api"

echo "🔍 ANALISANDO CARTEIRA: $WALLET"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Verificar se o servidor está rodando
if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ ERRO: Servidor não está rodando!"
    echo "   Execute: npm run dev"
    exit 1
fi

echo "📍 1. Buscando portfolio geral..."
curl -s "$API_URL/wallet/$WALLET/portfolio" | jq '.data | {totalValue, balance, tokenCount: (.tokens | length)}'

echo ""
echo "📍 2. Buscando TODOS os tokens (com logs detalhados no servidor)..."

# Fazer a requisição e capturar resposta
RESPONSE=$(curl -s "$API_URL/wallet/$WALLET/tokens")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ TOKENS ENCONTRADOS:"
    echo "$RESPONSE" | jq '.data | {
        wallet,
        totalTokens,
        tokens: [.tokens[] | {
            name,
            symbol,
            balance,
            isLPToken,
            tokenType,
            priceUSD
        }]
    }'
    
    echo ""
    echo "🔥 LP TOKENS DETECTADOS:"
    echo "$RESPONSE" | jq '.data.tokens[] | select(.isLPToken == true) | {name, symbol, balance}'
    
    echo ""
    echo "💰 TOKENS COM BALANCE > 0:"
    echo "$RESPONSE" | jq '.data.tokens[] | select(.balance > 0) | {name, symbol, balance, priceUSD}'
    
else
    echo "❌ ERRO na resposta:"
    echo "$RESPONSE" | jq '.'
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "📊 VERIFIQUE OS LOGS DO SERVIDOR para ver análise detalhada de cada token!"
echo "═══════════════════════════════════════════════════════════════════════════════" 