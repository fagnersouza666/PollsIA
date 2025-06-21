# API REST - PollsIA Backend

## Visão Geral

Esta é a documentação completa da API REST do PollsIA, um sistema automatizado de gestão de pools de liquidez na blockchain Solana com integração em tempo real ao Raydium DEX.

**Base URL:** `http://localhost:3001`  
**Arquitetura:** Node.js + Fastify + TypeScript  
**Blockchain:** Solana via `@solana/kit` (padrões modernos)

---

## Estrutura de Resposta Padrão

Todas as rotas seguem o padrão de resposta `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}
```

### Exemplo de Resposta de Sucesso
```json
{
  "success": true,
  "data": { /* dados específicos */ },
  "timestamp": "2025-06-21T10:30:00.000Z"
}
```

### Exemplo de Resposta de Erro
```json
{
  "success": false,
  "error": "Mensagem de erro descritiva",
  "timestamp": "2025-06-21T10:30:00.000Z"
}
```

---

## 🏊 Endpoints de Pools

### `GET /api/pools/discover`

Descobre pools de liquidez disponíveis nos protocolos suportados (principalmente Raydium).

#### Query Parameters
```typescript
{
  protocol?: 'raydium' | 'orca' | 'all';    // Protocolo DEX
  minTvl?: string;                          // TVL mínimo
  maxRisk?: 'low' | 'medium' | 'high';      // Nível máximo de risco
  sortBy?: 'apy' | 'tvl' | 'volume';        // Ordenação
  limit?: string;                           // Limite de resultados
}
```

#### Resposta
```typescript
ApiResponse<Pool[]>

interface Pool {
  id: string;           // ID único do pool
  tokenA: string;       // Símbolo do primeiro token
  tokenB: string;       // Símbolo do segundo token
  apy: number;          // APY anualizado (%)
  tvl: number;          // Total Value Locked (USD)
  volume24h: number;    // Volume 24h (USD)
  protocol: string;     // Protocolo (ex: "Raydium")
  address?: string;     // Endereço do pool na blockchain
  fees?: number;        // Taxa de trading (%)
  apr?: number;         // APR anualizado (%)
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/pools/discover?protocol=raydium&minTvl=1000000&sortBy=apy&limit=50"
```

#### Exemplo de Resposta
```json
{
  "success": true,
  "data": [
    {
      "id": "pool_123",
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
  "timestamp": "2025-06-21T10:30:00.000Z"
}
```

---

### `GET /api/pools/rankings`

Retorna ranking de pools baseado em algoritmos de pontuação que consideram APY, risco e liquidez.

#### Resposta
```typescript
ApiResponse<PoolRanking[]>

interface PoolRanking {
  rank: number;             // Posição no ranking
  poolId: string;           // ID do pool
  score: number;            // Score calculado (0-100)
  apy: number;              // APY do pool
  riskScore: number;        // Score de risco (0-10)
  liquidityScore: number;   // Score de liquidez (0-10)
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/pools/rankings"
```

#### Exemplo de Resposta
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "poolId": "pool_123",
      "score": 89.5,
      "apy": 12.45,
      "riskScore": 3.2,
      "liquidityScore": 9.1
    }
  ],
  "timestamp": "2025-06-21T10:30:00.000Z"
}
```

---

### `GET /api/pools/:poolId/analysis`

Análise detalhada de um pool específico incluindo métricas de risco e predições.

#### Path Parameters
- `poolId` (string): ID único do pool

#### Query Parameters
```typescript
{
  timeframe?: '1h' | '24h' | '7d' | '30d';   // Período de análise
  includeHistory?: boolean;                   // Incluir dados históricos
}
```

#### Resposta
```typescript
ApiResponse<PoolAnalysis>

interface PoolAnalysis {
  poolId: string;
  impermanentLoss: {
    current: number;            // IL atual (%)
    predicted30d: number;       // IL previsto 30 dias (%)
    historical: number[];       // Histórico de IL
  };
  volumeAnalysis: {
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: 'low' | 'medium' | 'high';
    prediction24h: number;      // Volume previsto 24h
  };
  riskMetrics: {
    overall: 'low' | 'medium' | 'high';
    liquidityRisk: 'low' | 'medium' | 'high';
    protocolRisk: 'low' | 'medium' | 'high';
    tokenRisk: 'low' | 'medium' | 'high';
  };
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/pools/pool_123/analysis?timeframe=7d&includeHistory=true"
```

---

## 💰 Endpoints de Carteira

### `POST /api/wallet/connect`

Conecta e valida uma carteira Solana na rede.

#### Request Body
```typescript
{
  publicKey: string;    // Chave pública da carteira (base58)
  signature: string;    // Assinatura de validação
}
```

#### Resposta
```typescript
ApiResponse<WalletConnection>

interface WalletConnection {
  publicKey: string;    // Chave pública confirmada
  connected: boolean;   // Status da conexão
  balance: number;      // Saldo SOL
}
```

#### Exemplo de Requisição
```bash
curl -X POST "http://localhost:3001/api/wallet/connect" \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337",
    "signature": "signature_hash_here"
  }'
```

#### Exemplo de Resposta
```json
{
  "success": true,
  "data": {
    "publicKey": "HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337",
    "connected": true,
    "balance": 12.456789
  },
  "timestamp": "2025-06-21T10:30:00.000Z"
}
```

---

### `GET /api/wallet/portfolio/:publicKey`

Obtém informações detalhadas do portfólio de uma carteira específica.

#### Path Parameters
- `publicKey` (string): Chave pública da carteira Solana

#### Resposta
```typescript
ApiResponse<Portfolio>

interface Portfolio {
  totalValue: number;       // Valor total em USD
  solBalance: number;       // Saldo SOL
  tokenAccounts: number;    // Número de contas de token
  change24h: number;        // Mudança 24h (%)
  performance: PerformanceData[];
}

interface PerformanceData {
  date: string;
  value: number;
  change: number;
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/wallet/portfolio/HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337"
```

#### Exemplo de Resposta
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
        "date": "2025-06-20",
        "value": 1200.45,
        "change": 2.1
      }
    ]
  },
  "timestamp": "2025-06-21T10:30:00.000Z"
}
```

---

### `GET /api/wallet/positions/:publicKey`

Lista todas as posições ativas de liquidez da carteira.

#### Path Parameters
- `publicKey` (string): Chave pública da carteira Solana

#### Resposta
```typescript
ApiResponse<Position[]>

interface Position {
  poolId: string;       // ID do pool
  tokenA: string;       // Token A do par
  tokenB: string;       // Token B do par
  liquidity: number;    // Liquidez fornecida
  value: number;        // Valor atual da posição (USD)
  apy: number;          // APY da posição
  entryDate: string;    // Data de entrada
  impermanentLoss: number; // Perda impermanente atual
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/wallet/positions/HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337"
```

#### Exemplo de Resposta
```json
{
  "success": true,
  "data": [
    {
      "poolId": "pool_123",
      "tokenA": "SOL",
      "tokenB": "USDC",
      "liquidity": 5000,
      "value": 5123.45,
      "apy": 12.45,
      "entryDate": "2025-06-15T10:00:00.000Z",
      "impermanentLoss": -2.3
    }
  ],
  "timestamp": "2025-06-21T10:30:00.000Z"
}
```

---

## 📊 Endpoints de Analytics

### `GET /api/analytics/performance/:publicKey`

Análise de performance detalhada de uma carteira específica.

#### Path Parameters
- `publicKey` (string): Chave pública da carteira Solana

#### Query Parameters
```typescript
{
  timeframe?: '7d' | '30d' | '90d' | '1y';   // Período de análise
}
```

#### Resposta
```typescript
ApiResponse<PerformanceData>

interface PerformanceData {
  totalReturn: number;      // Retorno total (%)
  alpha: number;            // Alpha da estratégia
  sharpeRatio: number;      // Índice Sharpe
  maxDrawdown: number;      // Máximo drawdown (%)
  timeframe: string;        // Período analisado
  history: Array<{
    date: string;
    value: number;
  }>;
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/analytics/performance/HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337?timeframe=30d"
```

---

### `GET /api/analytics/market-overview`

Visão geral do mercado DeFi na Solana.

#### Resposta
```typescript
ApiResponse<MarketOverview>

interface MarketOverview {
  totalTvl: number;         // TVL total do mercado
  averageApy: number;       // APY médio
  topPools: Array<{
    protocol: string;
    tvl: number;
    pools: number;
  }>;
  marketTrends: {
    tvlChange24h: number;     // Mudança TVL 24h (%)
    volumeChange24h: number;  // Mudança volume 24h (%)
    newPools24h: number;      // Novos pools 24h
  };
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/analytics/market-overview"
```

---

### `GET /api/analytics/opportunities`

Identifica oportunidades de investimento baseadas em análise algorítmica.

#### Query Parameters
```typescript
{
  riskLevel?: 'conservative' | 'moderate' | 'aggressive';
}
```

#### Resposta
```typescript
ApiResponse<Opportunity[]>

interface Opportunity {
  poolId: string;           // ID do pool
  protocol: string;         // Protocolo DEX
  tokenA: string;           // Token A
  tokenB: string;           // Token B
  estimatedApy: number;     // APY estimado
  riskScore: number;        // Score de risco (0-10)
  confidence: number;       // Confiança da predição (0-100)
  reason: string;           // Razão da oportunidade
}
```

#### Exemplo de Requisição
```bash
curl "http://localhost:3001/api/analytics/opportunities?riskLevel=moderate"
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso |
| `400` | Bad Request - Parâmetros inválidos |
| `404` | Not Found - Recurso não encontrado |
| `500` | Internal Server Error - Erro interno |

---

## Integração com Solana

### RPC Endpoint
- **Mainnet:** `https://api.mainnet-beta.solana.com`
- **Devnet:** `https://api.devnet.solana.com`

### Dependências Modernas
```json
{
  "@solana/kit": "^2.0.0",
  "@solana/rpc": "^2.0.0", 
  "@solana-program/token": "^0.1.0"
}
```

### Integração Raydium
- **API Base:** `https://api.raydium.io/v2`
- **Pools Endpoint:** `/sdk/liquidity/mainnet.json`
- **Dados:** 695,000+ pools em tempo real

---

## Rate Limits

| Endpoint | Limite |
|----------|--------|
| `/api/pools/discover` | 60 req/min |
| `/api/wallet/*` | 120 req/min |
| `/api/analytics/*` | 30 req/min |

---

## Configuração de Desenvolvimento

### Variáveis de Ambiente
```bash
# .env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PORT=3001
NODE_ENV=development
```

### Comandos
```bash
cd backend
npm run dev        # Servidor de desenvolvimento
npm run lint       # Verificar código
npm run typecheck  # Verificar tipos TypeScript
```

---

## Exemplo de Cliente

### JavaScript/TypeScript
```typescript
class PollsIAClient {
  private baseUrl = 'http://localhost:3001';

  async discoverPools(params?: {
    protocol?: string;
    minTvl?: string;
    sortBy?: string;
  }) {
    const query = new URLSearchParams(params as any);
    const response = await fetch(`${this.baseUrl}/api/pools/discover?${query}`);
    return response.json();
  }

  async getPortfolio(publicKey: string) {
    const response = await fetch(`${this.baseUrl}/api/wallet/portfolio/${publicKey}`);
    return response.json();
  }

  async connectWallet(publicKey: string, signature: string) {
    const response = await fetch(`${this.baseUrl}/api/wallet/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, signature })
    });
    return response.json();
  }
}
```

---

**Última Atualização:** Junho 2025  
**Versão da API:** 1.0  
**Framework:** Fastify + TypeScript  
**Blockchain:** Solana (@solana/kit)