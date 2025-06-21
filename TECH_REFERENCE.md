# Referência Técnica - PollsIA

Este arquivo contém padrões e snippets de código para o projeto PollsIA, organizados por tecnologia para garantir consistência e qualidade no desenvolvimento.

Textos sempre em português

## Arquitetura do Projeto

**Sistema:** Microserviços desacoplados
- **Backend:** Node.js/TypeScript + Fastify + PostgreSQL + Redis
- **Frontend:** Next.js 14 + TailwindCSS + Solana Wallet Adapter
- **Blockchain:** Integração com Solana via @solana/kit (padrões modernos)
- **Deploy:** Docker + Kubernetes
- **Real-time:** WebSockets para atualizações em tempo real
- **APIs:** Raydium DEX, CoinGecko, Phantom Wallet

---

## 1. Solana (@solana/kit - Padrões Modernos)

### Configuração de Conexão RPC

```typescript
// Usando @solana/kit (versão moderna)
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.mainnet-beta.solana.com");
```

### Criação de Keypair

```typescript
// Método moderno para gerar keypair
import { generateKeyPairSigner } from "@solana/kit";

const keypair = await generateKeyPairSigner();
console.log("public key:", keypair.address);
```

### Carregamento de Keypair de Arquivo

```typescript
// Carregar keypair existente de arquivo JSON
import { createKeyPairSignerFromBytes } from "@solana/kit";
import walletSecret from './wallet.json';

const keypairSigner = await createKeyPairSignerFromBytes(new Uint8Array(walletSecret));
```

### Transferência de SOL

```typescript
import { 
  address, 
  createKeyPairSignerFromBytes, 
  createTransactionMessage, 
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  lamports
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

const transferSol = async () => {
  const keypairSigner = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transaction = pipe(
    createTransactionMessage({ version: 0 }),
    m => setTransactionMessageFeePayerSigner(keypairSigner, m),
    m => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    m => appendTransactionMessageInstructions([
      getTransferSolInstruction({
        source: keypairSigner,
        destination: address("HM5ZgL6J9fRsrM8fj5dbJtVVq7Bz8J4eW48Caa1hT337"),
        amount: lamports(1n),
      }),
    ], m)
  );

  const signedTransaction = await signTransactionMessageWithSigners(transaction);
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
  
  await sendAndConfirmTransaction(signedTransaction, {
    commitment: 'processed',
    skipPreflight: true
  });
};
```

### Operações com Tokens

```typescript
// Mint tokens usando @solana-program/token
import { 
  TOKEN_PROGRAM_ADDRESS, 
  findAssociatedTokenPda, 
  getMintToInstruction 
} from "@solana-program/token";

const mintTokens = async () => {
  const mint = address('ERrUbrQcDf6EzChT8gTonvsKTiRrTG9YVhMDJhruHcjP');
  
  const [ata] = await findAssociatedTokenPda({
    mint: mint,
    owner: payer.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const instructions = [
    getMintToInstruction({
      mint: mint,
      token: ata,
      amount: BigInt(1_000_000_000),
      mintAuthority: payer.address
    })
  ];

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transaction = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(payer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx)
  );

  const signedTransaction = await signTransactionMessageWithSigners(transaction);
  await sendAndConfirmTransaction(signedTransaction, {
    commitment: 'processed',
    skipPreflight: true
  });
};
```

### Address Lookup Tables (ALT)

```typescript
// Criar ALT
import { 
  findAddressLookupTablePda,
  getCreateLookupTableInstructionAsync 
} from "@solana-program/address-lookup-table";

const createAlt = async (authority: KeyPairSigner) => {
  const recentSlot = await rpc.getSlot({ commitment: "finalized" }).send();

  const [alt] = await findAddressLookupTablePda({
    authority: authority.address,
    recentSlot
  });

  const createAltIx = await getCreateLookupTableInstructionAsync({
    authority,
    recentSlot
  });

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const tx = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(authority, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstruction(createAltIx, tx),
  );

  const signedTransaction = await signTransactionMessageWithSigners(tx);
  await sendAndConfirmTransaction(signedTransaction, {
    commitment: 'confirmed',
    skipPreflight: false
  });
  
  return alt;
};
```

### Buscar Informações da Blockchain

```typescript
// Obter saldo
const balance = await rpc.getBalance(address("...")).send();

// Obter slot atual
const slot = await rpc.getSlot().send();

// Obter taxa mínima de rent exemption
const rent = await rpc.getMinimumBalanceForRentExemption(BigInt(0)).send();

// Obter detalhes de transação
const transaction = await rpc.getTransaction(signature).send();
```

### Transações e Validação

```typescript
// Deserializar transação versionada
import { VersionedTransaction } from '@solana/kit';

const deserializeTransaction = (base64Tx: string) => {
  const serializedTx = Buffer.from(base64Tx, 'base64');
  const versionedTx = VersionedTransaction.deserialize(serializedTx);
  
  console.log('Signatures:', versionedTx.signatures);
  console.log('Version:', versionedTx.version);
  
  return versionedTx;
};
```

### Metadados de Token (Metaplex)

```typescript
// Criar metadata usando Metaplex Umi
import { createSignerFromKeypair, generateSigner, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { create } from '@metaplex-foundation/mpl-core';

const umi = createUmi("https://api.devnet.solana.com", "confirmed");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(walletSecret));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

const tokenAddress = generateSigner(umi);

const createTokenMetadata = async () => {
  const tx = await create(umi, {
    name: 'Test Token',
    uri: 'https://example.com/token.json',
    asset: tokenAddress,
    owner: signer.publicKey,
  }).sendAndConfirm(umi);
  
  console.log(`Transaction: ${tx.signature}`);
};
```

### Instalação de Dependências Modernas

```bash
# Pacote principal com todos os módulos
npm install @solana/kit

# Ou instalar módulos específicos
npm install @solana/rpc
npm install @solana/rpc-subscriptions
npm install @solana/accounts
npm install @solana/keys
npm install @solana/transactions
npm install @solana/transaction-messages

# Programas Solana (nova nomenclatura)
npm install @solana-program/system
npm install @solana-program/token
npm install @solana-program/address-lookup-table
npm install @solana-program/compute-budget

# Metaplex para NFTs e metadata
npm install @metaplex-foundation/umi
npm install @metaplex-foundation/umi-bundle-defaults
npm install @metaplex-foundation/mpl-core
npm install @metaplex-foundation/mpl-token-metadata
```

### Migração de @solana/web3.js para @solana/kit

```typescript
// ANTIGO (@solana/web3.js)
import { Connection, Keypair, SystemProgram, Transaction } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const keypair = Keypair.generate();

// NOVO (@solana/kit)
import { createSolanaRpc, generateKeyPairSigner } from '@solana/kit';

const rpc = createSolanaRpc('https://api.mainnet-beta.solana.com');
const keypair = await generateKeyPairSigner();
```

---

## 2. Next.js 14 (App Router)

### Estrutura de Arquivos

```
app/
├── layout.tsx          # Layout raiz
├── page.tsx           # Página inicial
├── globals.css        # Estilos globais
├── api/
│   └── route.ts       # Route Handlers
└── components/
    ├── client.tsx     # Client Components
    └── server.tsx     # Server Components
```

### Server Components

```typescript
// app/page.tsx
import { headers, cookies } from 'next/headers'

export default async function Page() {
  // Fetch de dados direto no Server Component
  const res = await fetch('https://api.exemplo.com/dados', {
    cache: 'no-store'  // SSR
    // next: { revalidate: 60 } // ISR
  });
  
  const dados = await res.json();
  
  return <div>{/* JSX */}</div>;
}
```

### Client Components

```typescript
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function ClientComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return <div>{/* JSX */}</div>;
}
```

### Route Handlers (API)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  
  return NextResponse.json({ data: 'resultado' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  return NextResponse.json({ success: true })
}
```

### Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.rewrite(new URL('/api/v1', request.url))
  }
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## 3. Fastify

### Configuração Básica do Servidor

```typescript
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

// Registro de plugins
await fastify.register(require('@fastify/cors'))
await fastify.register(require('@fastify/helmet'))

// Rota básica
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Iniciar servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
```

### Validação com Schemas

```typescript
const schema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: { type: 'object' }
      }
    }
  }
}

fastify.post('/login', { schema }, async (request, reply) => {
  const { email, password } = request.body
  // Lógica de autenticação
  return { token: 'jwt-token', user: {} }
})
```

### Hooks e Middleware

```typescript
// Hook global
fastify.addHook('preHandler', async (request, reply) => {
  // Validação de autenticação
  if (!request.headers.authorization) {
    reply.code(401).send({ error: 'Unauthorized' })
  }
})

// Hook específico da rota
fastify.get('/protected', {
  preHandler: async (request, reply) => {
    // Validação específica
  }
}, async (request, reply) => {
  return { data: 'protected' }
})
```

---

## 4. PostgreSQL (node-postgres)

### Configuração de Pool de Conexões

```typescript
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const query = (text: string, params?: any[]) => pool.query(text, params)
export const getClient = () => pool.connect()
```

### Transações

```typescript
export const withTransaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Uso
await withTransaction(async (client) => {
  await client.query('INSERT INTO users(name) VALUES($1)', ['João'])
  await client.query('INSERT INTO profiles(user_id) VALUES($1)', [userId])
})
```

### Queries Parametrizadas

```typescript
// Query simples
const users = await query('SELECT * FROM users WHERE active = $1', [true])

// Query complexa
const userWithPosts = await query(`
  SELECT 
    u.id, u.name, u.email,
    array_agg(
      json_build_object(
        'id', p.id,
        'title', p.title,
        'created_at', p.created_at
      )
    ) as posts
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  WHERE u.id = $1
  GROUP BY u.id, u.name, u.email
`, [userId])
```

---

## 5. Redis (node-redis)

### Configuração Básica

```typescript
import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

client.on('error', (err) => console.error('Redis Client Error', err))
await client.connect()

export default client
```

### Operações Básicas

```typescript
// Strings
await client.set('key', 'value', { EX: 3600 }) // Expira em 1h
const value = await client.get('key')

// Hashes
await client.hSet('user:123', {
  name: 'João',
  email: 'joao@email.com',
  lastLogin: Date.now()
})
const user = await client.hGetAll('user:123')

// Lists
await client.lPush('notifications', JSON.stringify({ message: 'Nova notificação' }))
const notifications = await client.lRange('notifications', 0, -1)

// Sets
await client.sAdd('online_users', 'user:123')
const isOnline = await client.sIsMember('online_users', 'user:123')
```

### Pub/Sub

```typescript
// Publisher
await client.publish('pools_updates', JSON.stringify({
  poolId: 'pool123',
  action: 'rebalance',
  timestamp: Date.now()
}))

// Subscriber
const subscriber = client.duplicate()
await subscriber.connect()

await subscriber.subscribe('pools_updates', (message) => {
  const data = JSON.parse(message)
  console.log('Pool update:', data)
})
```

---

## 6. WebSockets

### Servidor WebSocket com ws

```typescript
import { WebSocketServer } from 'ws'
import WebSocket from 'ws'

const wss = new WebSocketServer({ port: 8080 })

// Heartbeat para detectar conexões quebradas
function heartbeat() {
  this.isAlive = true
}

wss.on('connection', function connection(ws, req) {
  ws.isAlive = true
  ws.on('error', console.error)
  ws.on('pong', heartbeat)
  
  ws.on('message', function message(data, isBinary) {
    const message = JSON.parse(data.toString())
    
    // Broadcast para todos os clientes
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'broadcast',
          data: message
        }), { binary: isBinary })
      }
    })
  })
  
  // Enviar mensagem de boas-vindas
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Conectado ao PollsIA'
  }))
})

// Verificação de heartbeat
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate()
    
    ws.isAlive = false
    ws.ping()
  })
}, 30000)
```

### Integração com Fastify

```typescript
import FastifyWebSocket from '@fastify/websocket'

await fastify.register(FastifyWebSocket, {
  options: { 
    maxPayload: 1048576,
    verifyClient: function (info, next) {
      // Verificar autenticação
      const token = info.req.headers.authorization
      if (!validateToken(token)) {
        return next(false)
      }
      next(true)
    }
  }
})

fastify.get('/ws/pools', { websocket: true }, (socket, req) => {
  const userId = req.user.id
  
  socket.on('message', async (message) => {
    const data = JSON.parse(message.toString())
    
    switch (data.type) {
      case 'subscribe_pool':
        await subscribeToPool(userId, data.poolId)
        break
      case 'unsubscribe_pool':
        await unsubscribeFromPool(userId, data.poolId)
        break
    }
  })
  
  socket.on('close', () => {
    // Cleanup subscriptions
    cleanupUserSubscriptions(userId)
  })
})
```

---

## 7. TypeScript - Tipos Comuns

### Tipos para Solana (Modernos)

```typescript
import { Address, KeyPairSigner } from '@solana/kit';

export interface SolanaWallet {
  address: Address
  signer: KeyPairSigner
  balance: number
  tokenAccounts: TokenAccount[]
}

export interface TokenAccount {
  mint: Address
  balance: bigint
  decimals: number
  owner: Address
}

export interface RaydiumPool {
  id: string
  name: string
  ammId: string
  baseMint: string
  quoteMint: string
  tokenA: string
  tokenB: string
  liquidity: number
  volume24h: number
  apr24h: number
  tvl: number
  apy: number
  protocol: string
}

export interface Portfolio {
  totalValue: number
  solBalance: number
  tokenAccounts: number
  change24h: number
  performance: {
    daily: number
    weekly: number
    monthly: number
  }
}

export interface PoolPosition {
  poolId: string
  ammId: string
  tokenA: string
  tokenB: string
  liquidity: bigint
  fees: number
  apr: number
  userLiquidity: number
  rewards: number
}
```

### Tipos para API

```typescript
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PoolRebalanceRequest {
  poolId: string
  strategy: 'conservative' | 'moderate' | 'aggressive'
  maxSlippage: number
}
```

---

## 8. Estrutura de Pastas Recomendada

```
backend/
├── src/
│   ├── controllers/     # Controladores das rotas
│   ├── services/        # Lógica de negócio
│   ├── models/          # Modelos de dados
│   ├── schemas/         # Schemas de validação
│   ├── utils/           # Utilitários
│   ├── types/           # Tipos TypeScript
│   ├── config/          # Configurações
│   └── app.ts           # Entrada da aplicação
├── tests/
├── docker/
└── package.json

frontend/
├── app/
│   ├── (dashboard)/     # Grupo de rotas
│   ├── api/             # Route handlers
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários
│   ├── types/           # Tipos TypeScript
│   └── globals.css
├── public/
└── package.json
```

---

## 9. Variáveis de Ambiente

```bash
# .env.example

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pollsia
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_CLUSTER=mainnet-beta

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
```

---

## 10. Scripts Package.json

### Backend

```json
{
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/**/*.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### Frontend

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

---

Este arquivo deve ser atualizado conforme o projeto evolui e novos padrões são estabelecidos.