import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'PollsIA API - Gestão de Pools Solana',
            description: `
# 🚀 PollsIA - API REST para Gestão de Pools Solana

Sistema automatizado de gestão e otimização de pools de liquidez na blockchain Solana.

## ✨ Características Principais

- **🔗 Solana 2.0**: Integração moderna com Solana
- **📊 Dados em Tempo Real**: Integração com Raydium DEX
- **🤖 Analytics Avançado**: Métricas de performance
- **👛 Phantom Wallet**: Conexão nativa com carteira
- **⚡ Performance**: WebSockets para atualizações

## 🛠️ Stack Tecnológico

- **Backend**: Node.js 20+ + TypeScript + Fastify
- **Blockchain**: Solana 2.0 (mainnet-beta)
- **Banco de Dados**: Supabase (PostgreSQL) + Redis
- **APIs Externas**: Raydium DEX, CoinGecko, Solana RPC

## 📊 Rate Limits

| Grupo de Endpoints | Limite | Janela |
|-------------------|--------|--------|
| \`/api/pools/*\` | 60 req | 1 minuto |
| \`/api/wallet/*\` | 120 req | 1 minuto |
| \`/api/analytics/*\` | 30 req | 1 minuto |
| \`/health\` | Ilimitado | - |

## 🔐 Autenticação

### Versão Atual (v1.0)
- **Status**: API pública (sem autenticação)
- **Uso**: Livre para desenvolvimento e testes

## 🚨 Códigos de Status

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| \`200\` | ✅ Success | Operação bem-sucedida |
| \`400\` | ❌ Bad Request | Parâmetros inválidos |
| \`404\` | 🔍 Not Found | Recurso não encontrado |
| \`500\` | 💥 Internal Server Error | Erro interno |
            `,
            version: '1.0.0',
            contact: {
                name: 'PollsIA Development Team',
                email: 'dev@pollsia.com'
            },
            license: {
                name: 'MIT License',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: '🔧 Servidor de Desenvolvimento'
            }
        ],
        tags: [
            {
                name: 'Pools',
                description: '🏊 Operações com pools de liquidez'
            },
            {
                name: 'Wallet',
                description: '👛 Gestão de carteiras Solana'
            },
            {
                name: 'Analytics',
                description: '📊 Analytics e performance'
            },
            {
                name: 'Health',
                description: '❤️ Status e saúde da API'
            }
        ]
    },
    hideUntagged: true
}; 