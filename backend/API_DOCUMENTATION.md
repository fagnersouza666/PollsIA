# 🚀 PollsIA API - Documentação Completa

Sistema automatizado de gestão e otimização de pools de liquidez na blockchain Solana.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Rate Limits](#rate-limits)
4. [Endpoints](#endpoints)
   - [Health](#health)
   - [Pools](#pools)
   - [Wallet](#wallet)
   - [Analytics](#analytics)
5. [Schemas](#schemas)
6. [Códigos de Erro](#códigos-de-erro)
7. [Exemplos de Uso](#exemplos-de-uso)

## 🌟 Visão Geral

### Base URL
- **Desenvolvimento**: `http://localhost:3001`
- **Produção**: `https://api.pollsia.com`

### Características Principais
- **🔗 Solana 2.0**: Integração moderna com `@solana/rpc`, `@solana/keys`
- **📊 Dados em Tempo Real**: Integração direta com Raydium DEX (695k+ pools)
- **🤖 Analytics Avançado**: Métricas de performance e análise de riscos
- **👛 Phantom Wallet**: Conexão nativa com carteira Phantom
- **⚡ Performance**: WebSockets para atualizações em tempo real

### Stack Tecnológico
- **Backend**: Node.js 20+ + TypeScript + Fastify
- **Blockchain**: Solana 2.0 (mainnet-beta)
- **Banco de Dados**: PostgreSQL + Redis
- **APIs Externas**: Raydium DEX, CoinGecko, Solana RPC

## 🔐 Autenticação

### Versão Atual (v1.0)
- **Status**: API pública (sem autenticação)
- **Uso**: Livre para desenvolvimento e testes

### Versão Futura (v2.0)
- **JWT Bearer Token**: Para operações sensíveis
- **API Key**: Para integrações de terceiros
- **Rate Limiting**: Por usuário/API key

## 📊 Rate Limits

| Grupo de Endpoints | Limite | Janela | Descrição |
|-------------------|--------|--------|-----------|
| `/api/pools/*` | 60 req | 1 minuto | Descoberta e análise de pools |
| `/api/wallet/*` | 120 req | 1 minuto | Operações de carteira |
| `/api/analytics/*` | 30 req | 1 minuto | Analytics e performance |
| `/health` | Ilimitado | - | Status da API |

## 🛠️ Endpoints

### Health

#### `GET /health`
Verificar status da API e informações do sistema.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-21T15:30:45.123Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Pools

#### `GET /api/pools/discover`
Descobre pools de liquidez otimizados baseado em critérios específicos.

**Parâmetros de Query:**
- `protocol` (string, opcional): `raydium` | `orca` | `all`
- `minTvl` (string, opcional): TVL mínimo em USD
- `maxRisk` (string, opcional): `low` | `medium` | `high`
- `sortBy` (string, opcional): `apy` | `tvl` | `volume`
- `limit` (string, opcional): Número máximo de pools (1-50)

**Exemplo de Requisição:**
```bash
GET /api/pools/discover?protocol=raydium&minTvl=1000000&sortBy=apy&limit=10
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pool_sol_usdc_001",
      "tokenA": "SOL",
      "tokenB": "USDC",
      "apy": 12.45,
      "tvl": 15000000,
      "volume24h": 2500000,
      "protocol": "Raydium",
      "address": "GmGmZyuWpuNFfgqQLQ7DfGRaLevgvWV8Br4J8RdE6zU4",
      "fees": 0.25,
      "apr": 11.80
    }
  ],
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

#### `GET /api/pools/rankings`
Retorna rankings de pools baseado em algoritmo proprietário de scoring.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "poolId": "pool_sol_usdc_001",
      "score": 89.5,
      "apy": 12.45,
      "riskScore": 3.2,
      "liquidityScore": 9.1
    }
  ],
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

#### `GET /api/pools/{poolId}/analysis`
Fornece análise aprofundada de um pool específico.

**Parâmetros de Path:**
- `poolId` (string, obrigatório): ID único do pool

**Parâmetros de Query:**
- `timeframe` (string, opcional): `1h` | `24h` | `7d` | `30d`
- `includeHistory` (boolean, opcional): Incluir dados históricos

**Resposta:**
```json
{
  "success": true,
  "data": {
    "poolId": "pool_sol_usdc_001",
    "impermanentLoss": {
      "current": -2.3,
      "predicted30d": -5.1,
      "historical": [-1.2, -2.3, -1.8, -2.9]
    },
    "volumeAnalysis": {
      "trend": "increasing",
      "volatility": "medium",
      "prediction24h": 2800000
    },
    "riskMetrics": {
      "overall": "medium",
      "liquidityRisk": "low",
      "protocolRisk": "low",
      "tokenRisk": "medium"
    }
  },
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

### Wallet

#### `POST /api/wallet/connect`
Conecta uma carteira Solana à plataforma.

**Body:**
```json
{
  "publicKey": "HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337",
  "signature": "3yZe7d4xKrEnc8TKvKKKjdjjdjdj..."
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "publicKey": "HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337",
    "connected": true,
    "balance": 12.456789
  },
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

#### `GET /api/wallet/{publicKey}/portfolio`
Retorna análise completa do portfólio de uma carteira.

**Parâmetros de Path:**
- `publicKey` (string, obrigatório): Chave pública da carteira

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalValue": 1247.89,
    "solBalance": 12.456789,
    "tokenAccounts": 8,
    "change24h": 3.45,
    "performance": [
      {
        "date": "2024-12-20",
        "value": 1200.45,
        "change": 2.1
      }
    ]
  },
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

#### `GET /api/wallet/{publicKey}/positions`
Retorna todas as posições ativas da carteira em pools de liquidez.

**Parâmetros de Path:**
- `publicKey` (string, obrigatório): Chave pública da carteira

**Parâmetros de Query:**
- `active` (boolean, opcional): Filtrar apenas posições ativas
- `minValue` (number, opcional): Valor mínimo da posição em USD
- `protocol` (string, opcional): `raydium` | `orca` | `all`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "poolId": "pool_sol_usdc_001",
      "tokenA": "SOL",
      "tokenB": "USDC",
      "liquidity": 5000,
      "value": 5123.45,
      "apy": 12.45,
      "entryDate": "2024-12-15T10:00:00.000Z",
      "impermanentLoss": -2.3
    }
  ],
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

#### `DELETE /api/wallet/{publicKey}/disconnect`
Desconecta uma carteira da plataforma.

**Parâmetros de Path:**
- `publicKey` (string, obrigatório): Chave pública da carteira

**Resposta:**
```json
{
  "success": true,
  "data": {
    "disconnected": true
  },
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

### Analytics

#### `GET /api/analytics/market-overview`
Fornece visão abrangente do estado atual do mercado DeFi na Solana.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalTvl": 2500000000,
    "averageApy": 8.75,
    "topPools": [
      {
        "protocol": "Raydium",
        "tvl": 1500000000,
        "pools": 250
      },
      {
        "protocol": "Orca",
        "tvl": 1000000000,
        "pools": 180
      }
    ],
    "marketTrends": {
      "tvlChange24h": 2.5,
      "volumeChange24h": -1.2,
      "newPools24h": 3
    }
  },
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

#### `GET /api/analytics/opportunities`
Identifica oportunidades de investimento baseado em análise algorítmica.

**Parâmetros de Query:**
- `riskLevel` (string, opcional): `low` | `medium` | `high` | `all`
- `minApy` (number, opcional): APY mínimo esperado (%)
- `timeframe` (string, opcional): `short` | `medium` | `long`
- `amount` (number, opcional): Valor a ser investido (USD)
- `strategy` (string, opcional): `conservative` | `balanced` | `aggressive` | `yield-farming`
- `limit` (integer, opcional): Número máximo de oportunidades (1-20)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "poolId": "pool_sol_usdc_001",
      "protocol": "Raydium",
      "tokenA": "SOL",
      "tokenB": "USDC",
      "estimatedApy": 12.45,
      "riskScore": 3.2,
      "confidence": 0.85,
      "reason": "High APY potential + Strong liquidity + Low risk profile"
    }
  ],
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

#### `GET /api/analytics/performance`
Fornece análise detalhada da performance histórica.

**Parâmetros de Query:**
- `period` (string, opcional): `24h` | `7d` | `30d` | `90d` | `1y` | `all`
- `strategy` (string, opcional): `conservative` | `balanced` | `aggressive` | `yield-farming` | `all`
- `protocol` (string, opcional): `raydium` | `orca` | `jupiter` | `all`
- `benchmark` (string, opcional): `sol` | `usdc` | `market` | `none`
- `includeRisk` (boolean, opcional): Incluir métricas de risco detalhadas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "totalReturn": 12.5,
    "annualizedReturn": 150.0,
    "volatility": 25.3,
    "sharpeRatio": 1.85,
    "maxDrawdown": -8.2,
    "winRate": 68.5,
    "benchmark": {
      "name": "SOL",
      "return": 8.3,
      "outperformance": 4.2
    },
    "byStrategy": [
      {
        "strategy": "conservative",
        "return": 8.5,
        "risk": 15.2,
        "sharpe": 1.25
      }
    ]
  },
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

## 📝 Schemas

### Pool
```typescript
interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  apy: number;
  tvl: number;
  volume24h: number;
  protocol: string;
  address?: string;
  fees?: number;
  apr?: number;
}
```

### Portfolio
```typescript
interface Portfolio {
  totalValue: number;
  solBalance: number;
  tokenAccounts: number;
  change24h: number;
  performance: PerformanceData[];
}
```

### Position
```typescript
interface Position {
  poolId: string;
  tokenA: string;
  tokenB: string;
  liquidity: number;
  value: number;
  apy: number;
  entryDate: string;
  impermanentLoss?: number;
}
```

### ApiResponse
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## 🚨 Códigos de Erro

| Código | Significado | Descrição |
|--------|-------------|-----------|
| `200` | ✅ Success | Operação bem-sucedida |
| `400` | ❌ Bad Request | Parâmetros inválidos ou malformados |
| `401` | 🔒 Unauthorized | Token inválido ou expirado |
| `404` | 🔍 Not Found | Recurso não encontrado |
| `429` | 🚫 Too Many Requests | Rate limit excedido |
| `500` | 💥 Internal Server Error | Erro interno do servidor |

### Exemplo de Resposta de Erro
```json
{
  "success": false,
  "error": "Pool não encontrado ou indisponível",
  "timestamp": "2024-12-21T15:30:45.123Z"
}
```

## 💡 Exemplos de Uso

### 1. Descobrir Pools de Alto Rendimento
```bash
curl -X GET "http://localhost:3001/api/pools/discover?minTvl=1000000&sortBy=apy&limit=5" \
  -H "Accept: application/json"
```

### 2. Conectar Carteira Phantom
```bash
curl -X POST "http://localhost:3001/api/wallet/connect" \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337",
    "signature": "signature_hash_here"
  }'
```

### 3. Obter Análise de Mercado
```bash
curl -X GET "http://localhost:3001/api/analytics/market-overview" \
  -H "Accept: application/json"
```

### 4. Identificar Oportunidades Conservadoras
```bash
curl -X GET "http://localhost:3001/api/analytics/opportunities?riskLevel=low&minApy=5&limit=10" \
  -H "Accept: application/json"
```

### 5. Analisar Pool Específico
```bash
curl -X GET "http://localhost:3001/api/pools/pool_sol_usdc_001/analysis?timeframe=30d&includeHistory=true" \
  -H "Accept: application/json"
```

## 🔗 Links Úteis

- **Swagger UI**: `http://localhost:3001/docs`
- **OpenAPI Spec**: `http://localhost:3001/docs/json`
- **GitHub**: [PollsIA Repository](https://github.com/pollsia/api)
- **Raydium DEX**: [Documentação Oficial](https://docs.raydium.io/)
- **Solana RPC**: [Documentação Oficial](https://docs.solana.com/api)

## 🐛 Troubleshooting

### Problemas Comuns

1. **Timeout nas Requisições**
   - Algumas operações podem demorar devido à latência da Solana RPC
   - Aumente o timeout do cliente para 30 segundos

2. **Pool Não Encontrado**
   - Verifique se o poolId está correto
   - Alguns pools podem estar temporariamente indisponíveis

3. **Carteira Inválida**
   - Certifique-se que a chave pública é válida (formato base58)
   - Verifique se a carteira existe na rede mainnet-beta

4. **Rate Limit Excedido**
   - Respeite os limites de requisições por minuto
   - Implemente backoff exponencial nas suas requisições

### Suporte

- **Issues**: [GitHub Issues](https://github.com/pollsia/api/issues)
- **Email**: dev@pollsia.com
- **Documentação**: [Docs Completas](https://github.com/pollsia/api/blob/main/README.md)

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Status**: Documentação Completa ✅