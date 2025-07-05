# PollsIA - Projeto Solana DeFi

## Visão Geral

O PollsIA é uma plataforma DeFi construída na blockchain Solana que permite a criação e participação em enquetes descentralizadas com recompensas em tokens. A arquitetura segue padrões de desenvolvimento rigorosos para garantir qualidade, manutenibilidade e escalabilidade.

SEMPRE use context7 para consultar documentações.
SEMPRE exclua arquivos de testes, ou nao usados no projetos, em que a extensão não for .md

## Arquitetura do Projeto

### Stack Tecnológica

#### Backend
- **Runtime**: Node.js 18+ com TypeScript 5.0+
- **Framework**: Fastify (alta performance)
- **Database**: MongoDB (principal) + PostgreSQL (analytics)
- **Validation**: Zod para schemas e validações
- **Testing**: Jest + Supertest + MongoDB Memory Server
- **Logging**: Winston com structured logging

#### Frontend
npm run dev:frontend       # Next.js dev server
npm run build:frontend     # Next.js build
npm run start:frontend     # Next.js production
npm run analyze:bundle     # Bundle analysis
- **Framework**: React 18+ + Next.js 14+ (App Router)
- **Language**: TypeScript com strict mode
- **Styling**: Tailwind CSS + Shadcn/UI + CSS Modules
- **State Management**: Context API + useReducer + React Query
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library + Playwright (E2E)
- **Performance**: Next.js Image + Font optimization + Bundle analysis

#### Blockchain
- **Network**: Solana (Mainnet/Devnet)
- **DeFi Integration**: Raydium SDK para liquidity pools
- **Wallet**: Phantom Wallet integration
- **Smart Contracts**: Anchor Framework

### Estrutura de Pastas

```
PollsIA/
├── backend/                    # Node.js API Server
│   ├── src/
│   │   ├── domain/            # Entidades e regras de negócio
│   │   │   ├── entities/      # Objetos de domínio
│   │   │   ├── repositories/  # Interfaces de repositório
│   │   │   └── services/      # Serviços de domínio
│   │   ├── application/       # Casos de uso e comandos
│   │   │   ├── commands/      # Command handlers
│   │   │   ├── queries/       # Query handlers
│   │   │   └── services/      # Application services
│   │   ├── infrastructure/    # Implementações técnicas
│   │   │   ├── database/      # Repositórios concretos
│   │   │   ├── external/      # APIs externas
│   │   │   └── blockchain/    # Solana integrations
│   │   ├── presentation/      # Controladores HTTP
│   │   │   ├── controllers/   # Route handlers
│   │   │   ├── middlewares/   # Express middlewares
│   │   │   └── validators/    # Request validators
│   │   └── shared/           # Utilitários compartilhados
│   │       ├── config/       # Configurações
│   │       ├── errors/       # Custom errors
│   │       ├── types/        # Type definitions
│   │       └── utils/        # Helper functions
│   ├── tests/                # Testes organizados por camada
│   │   ├── unit/            # Testes unitários
│   │   ├── integration/     # Testes de integração
│   │   └── e2e/            # Testes end-to-end
│   ├── docker/              # Docker configurations
│   └── docs/               # Documentação técnica
├── frontend/               # React.js Interface
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   │   ├── (auth)/    # Rotas autenticadas (route group)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── polls/
│   │   │   │   ├── profile/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── (public)/  # Rotas públicas (route group)
│   │   │   │   ├── about/
│   │   │   │   ├── contact/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── api/       # API routes
│   │   │   │   ├── auth/
│   │   │   │   ├── polls/
│   │   │   │   └── webhook/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx  # Root layout
│   │   │   ├── page.tsx    # Home page
│   │   │   ├── loading.tsx # Global loading
│   │   │   ├── error.tsx   # Global error
│   │   │   ├── not-found.tsx
│   │   │   └── template.tsx
│   │   ├── components/    # Componentes React
│   │   │   ├── ui/       # Componentes básicos (shadcn/ui)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── index.ts
│   │   │   ├── forms/    # Componentes de formulário
│   │   │   ├── layout/   # Layout components
│   │   │   │   ├── header.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── navigation.tsx
│   │   │   └── features/ # Feature components
│   │   │       ├── auth/
│   │   │       ├── polls/
│   │   │       └── wallet/
│   │   ├── hooks/        # Custom hooks
│   │   │   ├── api/      # API hooks
│   │   │   ├── blockchain/ # Blockchain hooks
│   │   │   ├── common/   # Common hooks
│   │   │   └── use-client-side.ts # Client-side only hook
│   │   ├── contexts/     # Context providers
│   │   │   ├── auth-context.tsx
│   │   │   ├── wallet-context.tsx
│   │   │   └── theme-context.tsx
│   │   ├── services/     # API services
│   │   │   ├── api/      # HTTP client
│   │   │   ├── blockchain/ # Solana services
│   │   │   └── storage/  # Local storage
│   │   ├── lib/          # Utilities e configurações
│   │   │   ├── utils.ts  # Utility functions
│   │   │   ├── cn.ts     # className utils
│   │   │   ├── validations.ts # Zod schemas
│   │   │   └── constants.ts
│   │   ├── types/        # TypeScript types
│   │   │   ├── api.ts    # API types
│   │   │   ├── blockchain.ts # Blockchain types
│   │   │   └── global.d.ts
│   │   └── styles/       # Global styles
│   │       ├── globals.css
│   │       └── components.css
│   ├── tests/            # Testes do frontend
│   │   ├── __mocks__/    # Mocks
│   │   ├── components/   # Component tests
│   │   ├── pages/        # Page tests
│   │   ├── e2e/          # Playwright E2E
│   │   └── setup.ts      # Test setup
│   ├── public/           # Assets estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── manifest.json
│   ├── docs/            # Documentação do frontend
│   ├── next.config.js   # Next.js config
│   ├── tailwind.config.js
│   ├── components.json  # shadcn/ui config
│   ├── middleware.ts    # Next.js middleware
│   └── playwright.config.ts
├── shared/               # Código compartilhado
│   ├── types/           # Types compartilhados
│   ├── schemas/         # Zod schemas
│   └── constants/       # Constantes
├── docs/                # Documentação geral
├── scripts/             # Scripts de automação
└── docker-compose.yml   # Orquestração de containers
```

## Padrões de Desenvolvimento

### Node.js Backend - Compliance com `claude_nodejs.md`

#### SEMPRE Implementar:
- ✅ **TypeScript strict mode**: Tipagem rigorosa em todo o código
- ✅ **Dependency injection**: InversifyJS para inversão de controle
- ✅ **Async/await**: Nunca usar callbacks, sempre promessas
- ✅ **Result pattern**: Tratamento de erros sem exceções
- ✅ **Validation**: Zod para validação de entrada e saída
- ✅ **Structured logging**: Winston com formatação JSON
- ✅ **Environment configs**: Configurações centralizadas
- ✅ **Testing**: Jest + Supertest com 80%+ cobertura

#### NUNCA Fazer:
- ❌ JavaScript puro (sempre TypeScript)
- ❌ require() direto (usar injeção de dependência)
- ❌ Callbacks (usar async/await)
- ❌ throw Error genérico (usar Result pattern)
- ❌ Validação manual (usar Zod)
- ❌ console.log (usar logger estruturado)
- ❌ Hardcoded values (usar configurações)
- ❌ Testes sem mocks apropriados

### React.js + Next.js Frontend - Compliance com `claude_reactjs.md`

#### SEMPRE Implementar:
- ✅ **TypeScript strict mode**: Tipagem rigorosa
- ✅ **Functional components**: Apenas hooks, não classes
- ✅ **Custom hooks**: Lógica reutilizável encapsulada
- ✅ **Context + useReducer**: State management global
- ✅ **Error boundaries**: Tratamento de erros da UI
- ✅ **Memoization**: useMemo/useCallback quando apropriado
- ✅ **Zod validation**: Validação de formulários
- ✅ **React Query**: Gerenciamento de estado do servidor

#### Next.js Melhores Práticas:
- ✅ **App Router**: Usar App Router (não Pages Router)
- ✅ **Server Components**: Usar RSC quando possível
- ✅ **Image optimization**: Next.js Image component
- ✅ **Font optimization**: next/font para web fonts
- ✅ **Static Generation**: ISG/SSG para páginas estáticas
- ✅ **API Routes**: API routes para funcionalidades server-side
- ✅ **Metadata API**: SEO com Metadata API
- ✅ **Loading states**: loading.tsx e error.tsx
- ✅ **Route groups**: Organização com route groups
- ✅ **Middleware**: Autenticação e redirects
- ✅ **Bundle analysis**: @next/bundle-analyzer

#### NUNCA Fazer:
- ❌ Class components (usar functional)
- ❌ JavaScript puro (sempre TypeScript)
- ❌ Props drilling excessivo (usar Context)
- ❌ State diretamente mutado (imutabilidade)
- ❌ useEffect sem dependencies (especificar deps)
- ❌ Inline functions em JSX (performance)
- ❌ Any type (usar tipagem específica)
- ❌ Fetch direto (usar React Query)

#### Next.js Anti-Patterns:
- ❌ Pages Router (usar App Router)
- ❌ getServerSideProps/getStaticProps (usar RSC)
- ❌ <img> tag (usar next/image)
- ❌ Google Fonts via CDN (usar next/font)
- ❌ Client Components desnecessários
- ❌ Heavy JavaScript no cliente
- ❌ Missing error.tsx e loading.tsx
- ❌ Não usar route groups para organização

## Comandos do Projeto

### Desenvolvimento Local

```bash
# Instalar todas as dependências
npm run install:all

# Iniciar desenvolvimento
npm run dev:backend     # Backend na porta 3001
npm run dev:frontend    # Frontend na porta 3000
npm run dev:all         # Ambos simultaneamente

# Verificações de qualidade
npm run lint            # ESLint em todo o projeto
npm run typecheck       # TypeScript check
npm run test:all        # Todos os testes
npm run check:all       # Lint + typecheck + tests

# Preparação para commit
npm run pre-commit      # Verificação completa antes do commit
```

### Produção

```bash
# Build completo
npm run build:backend   # Build do backend
npm run build:frontend  # Build do frontend
npm run build:all       # Build completo

# Deploy com Docker
npm start               # Docker Compose up
npm stop                # Docker Compose down
npm run deploy          # Deploy para produção
```

### Testes

```bash
# Backend
npm run test:backend:unit        # Testes unitários
npm run test:backend:integration # Testes de integração
npm run test:backend:e2e        # Testes end-to-end

# Testes
npm run test:frontend:unit      # Testes unitários (Jest)
npm run test:frontend:integration # Testes de integração
npm run test:frontend:e2e       # Testes E2E (Playwright)
npm run test:frontend:watch     # Watch mode

# Cobertura
npm run test:coverage           # Relatório de cobertura
```

## Status de Compliance

### Backend (Node.js) - 46% → 90% (Target)

#### ✅ Implementado:
- TypeScript strict mode
- Zod validation
- Environment configuration

#### ❌ Pendente (Prioridade Alta):
- Dependency injection (InversifyJS)
- Result pattern para error handling
- Structured logging (Winston)
- Clean architecture (DDD)
- Custom error hierarchy

### Frontend (React.js + Next.js) - 31% → 90% (Target)

#### ✅ Implementado:
- TypeScript strict mode
- Functional components
- React Query setup

#### ❌ Pendente (Prioridade Alta):
- **Next.js App Router**: Migração completa do Pages Router
- **Server Components**: Implementar RSC onde apropriado
- **Image optimization**: next/image em todas as imagens
- **Font optimization**: next/font para web fonts
- **Metadata API**: SEO otimizado
- **Route groups**: Organização de rotas
- **Loading/Error states**: loading.tsx e error.tsx
- **Middleware**: Autenticação e redirects
- **Custom hooks organization**
- **Error boundaries**
- **Service layer abstraction**
- **Zod form validation**
- **Memoization patterns**

## Roadmap de Desenvolvimento

### Sprint 1 - Fundação Arquitetural (2 semanas)

#### Backend:
1. **Dependency Injection**: Configurar InversifyJS
2. **Result Pattern**: Implementar error handling
3. **Structured Logging**: Configurar Winston
4. **Custom Errors**: Criar hierarquia de erros

#### Frontend:
1. **Next.js App Router**: Migrar para App Router completo
2. **Server Components**: Identificar e implementar RSC
3. **Image/Font Optimization**: next/image e next/font
4. **Route Organization**: Implementar route groups
5. **Loading/Error States**: Adicionar loading.tsx e error.tsx
6. **Error Boundaries**: Implementar tratamento de erros
7. **Service Layer**: Criar abstrações de API
8. **Custom Hooks**: Organizar hooks por domínio

### Sprint 2 - Qualidade e Testes (2 semanas)

#### Backend:
1. **Clean Architecture**: Reestruturar para DDD
2. **Testing**: Aumentar cobertura para 80%+
3. **Validation**: Completar validação com Zod

#### Frontend:
1. **App Router Migration**: Completar migração para App Router
2. **Server Components**: Otimizar com RSC
3. **Form Validation**: Implementar Zod + React Hook Form
4. **Performance**: Implementar memoization e code splitting
5. **SEO**: Implementar Metadata API
6. **Testing**: Implementar testes de componentes + E2E

### Sprint 3 - Integração Blockchain (3 semanas)

#### Solana Integration:
1. **Wallet Connection**: Phantom Wallet
2. **Smart Contracts**: Deploy e integração
3. **Raydium SDK**: Liquidity pools
4. **Transaction Handling**: Confirmações e rollbacks

## Verificação de Qualidade

### Scripts de Verificação

```bash
# Verificação completa (obrigatória antes de commits)
npm run check:all

# Verificações individuais
npm run lint:backend        # ESLint backend
npm run lint:frontend       # ESLint frontend
npm run typecheck:backend   # TypeScript backend
npm run typecheck:frontend  # TypeScript frontend
npm run test:unit           # Testes unitários
npm run test:integration    # Testes de integração
npm run test:e2e           # Testes E2E

# Next.js específicos
npm run build:check        # Verificar build Next.js
npm run lighthouse         # Performance audit
npm run accessibility      # Accessibility audit
```

### Critérios de Qualidade

- **Cobertura de Testes**: Mínimo 80%
- **TypeScript**: Sem erros de tipagem
- **ESLint**: Sem warnings ou errors
- **Performance**: Lighthouse score > 90
- **Acessibilidade**: WCAG 2.1 AA compliance
- **Bundle Size**: <250KB initial bundle
- **Core Web Vitals**: 
  - LCP < 2.5s
  - FID < 100ms  
  - CLS < 0.1
- **SEO**: Meta tags e structured data
- **Next.js**: App Router compliance 100%

## Padrões de Commit

### Conventional Commits

```bash
# Features
feat(backend): add user authentication
feat(frontend): implement poll creation form

# Fixes
fix(api): resolve authentication token validation
fix(ui): correct button hover states

# Refactoring
refactor(backend): implement dependency injection
refactor(frontend): extract custom hooks

# Tests
test(backend): add user service unit tests
test(frontend): add poll component tests
```

### Pre-commit Hooks

Automaticamente executados antes de cada commit:
1. **Lint**: ESLint check
2. **TypeScript**: Type checking
3. **Tests**: Execução de testes unitários
4. **Formatting**: Prettier formatting

## Configuração do Ambiente

### Variáveis de Ambiente

```bash
# Backend (.env)
DATABASE_URL=mongodb://localhost:27017/pollsia
POSTGRES_URL=postgresql://user:pass@localhost:5432/pollsia_analytics
JWT_SECRET=your-secret-key
SOLANA_RPC_URL=https://api.devnet.solana.com
RAYDIUM_API_KEY=your-raydium-key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PHANTOM_WALLET_ADAPTER=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Requisitos do Sistema

- **Node.js**: 18.0.0 ou superior
- **npm**: 9.0.0 ou superior
- **Docker**: 20.0.0 ou superior
- **MongoDB**: 5.0 ou superior
- **PostgreSQL**: 14.0 ou superior

## Instruções para Claude Code

### Regras Fundamentais

1. **Seguir Padrões**: Sempre aderir aos padrões em `claude_nodejs.md` e `claude_reactjs.md`
2. **Verificar Compliance**: Executar `npm run check:all` antes de qualquer commit
3. **Priorizar Refatoração**: Focar na melhoria arquitetural conforme análise de compliance
4. **Documentação**: Manter documentação atualizada com mudanças significativas

### Fluxo de Desenvolvimento

1. **Análise**: Entender o requisito e sua arquitetura
2. **Planejamento**: Definir approach seguindo os padrões
3. **Implementação**: Desenvolver com qualidade desde o início
4. **Validação**: Executar verificações de qualidade
5. **Commit**: Usar conventional commits

### Regras de Edição

- **Editar > Criar**: Sempre preferir editar arquivos existentes
- **Necessidade**: Criar arquivos apenas quando absolutamente necessário
- **Documentação**: Não criar arquivos `.md` proativamente
- **Objetivo**: Fazer exatamente o que foi solicitado, nada mais, nada menos

## Melhores Práticas Next.js 14+

### App Router Architecture

#### File-based Routing
```typescript
// app/layout.tsx - Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// app/(auth)/layout.tsx - Nested Layout
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

#### Loading & Error States
```typescript
// app/polls/loading.tsx
export default function Loading() {
  return <PollsSkeleton />
}

// app/polls/error.tsx
'use client'
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error-boundary">
      <h2>Algo deu errado!</h2>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  )
}
```

### Server Components vs Client Components

#### Server Components (Default)
```typescript
// app/polls/page.tsx - Server Component
import { getPolls } from '@/lib/api'

export default async function PollsPage() {
  const polls = await getPolls() // Fetch no servidor
  
  return (
    <div>
      <h1>Enquetes</h1>
      <PollsList polls={polls} />
    </div>
  )
}
```

#### Client Components
```typescript
// components/wallet-button.tsx - Client Component
'use client'
import { useWallet } from '@solana/wallet-adapter-react'

export function WalletButton() {
  const { connected, connect, disconnect } = useWallet()
  
  return (
    <button onClick={connected ? disconnect : connect}>
      {connected ? 'Desconectar' : 'Conectar Carteira'}
    </button>
  )
}
```

### Metadata API para SEO

```typescript
// app/polls/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const poll = await getPoll(params.id)
  
  return {
    title: poll.title,
    description: poll.description,
    openGraph: {
      title: poll.title,
      description: poll.description,
      images: [poll.image],
    },
  }
}
```

### Image & Font Optimization

```typescript
// components/poll-card.tsx
import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export function PollCard({ poll }: { poll: Poll }) {
  return (
    <div className={inter.className}>
      <Image
        src={poll.image}
        alt={poll.title}
        width={300}
        height={200}
        priority={poll.featured}
        className="rounded-lg"
      />
      <h3>{poll.title}</h3>
    </div>
  )
}
```

### API Routes

```typescript
// app/api/polls/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createPollSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  options: z.array(z.string()).min(2),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createPollSchema.parse(body)
    
    const poll = await createPoll(data)
    
    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
```

### Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Autenticação
  const token = request.cookies.get('auth-token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Rate Limiting
  const ip = request.ip ?? '127.0.0.1'
  // Implementar rate limiting
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### Performance Optimization

#### Code Splitting
```typescript
// Dynamic imports para componentes pesados
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Se não precisar de SSR
})

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  )
}
```

#### Bundle Analysis
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  experimental: {
    serverComponentsExternalPackages: ['@solana/web3.js'],
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
})
```

### Type Safety

#### Route Params
```typescript
// lib/types.ts
export interface PageProps<T = {}> {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
}

// app/polls/[id]/page.tsx
export default function PollPage({
  params,
  searchParams,
}: PageProps<{ id: string }>) {
  // params.id é tipado como string
  // searchParams é tipado
}
```

#### API Route Types
```typescript
// lib/api-types.ts
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PollCreateRequest {
  title: string
  description: string
  options: string[]
}
```

### Testing com Next.js

#### Component Testing
```typescript
// tests/components/poll-card.test.tsx
import { render, screen } from '@testing-library/react'
import { PollCard } from '@/components/poll-card'

const mockPoll = {
  id: '1',
  title: 'Test Poll',
  description: 'Test Description',
  image: '/test-image.jpg',
}

test('renders poll card', () => {
  render(<PollCard poll={mockPoll} />)
  
  expect(screen.getByText('Test Poll')).toBeInTheDocument()
  expect(screen.getByAltText('Test Poll')).toBeInTheDocument()
})
```

#### E2E Testing com Playwright
```typescript
// tests/e2e/polls.spec.ts
import { test, expect } from '@playwright/test'

test('create new poll', async ({ page }) => {
  await page.goto('/dashboard/polls/new')
  
  await page.fill('[data-testid="poll-title"]', 'My Test Poll')
  await page.fill('[data-testid="poll-description"]', 'Test description')
  
  await page.click('[data-testid="submit-button"]')
  
  await expect(page).toHaveURL(/\/polls\/\w+/)
  await expect(page.getByText('My Test Poll')).toBeVisible()
})
```

### Configuration Files

#### Next.js Config
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@solana/web3.js'],
  },
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

#### Tailwind Config
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Links Úteis

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Solana Documentation](https://docs.solana.com/)
- [Raydium SDK](https://docs.raydium.io/)
- [Phantom Wallet](https://phantom.app/developer-docs)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev/)

### Comandos Úteis

```bash
# Limpar cache e dependências
npm run clean
npm run clean:next         # Limpar .next cache

# Atualizar dependências
npm run update:deps

# Gerar relatórios
npm run report:bundle      # Bundle analysis
npm run report:coverage    # Test coverage
npm run report:security    # Security audit
npm run report:lighthouse  # Performance report

# Next.js específicos
npm run export             # Static export
npm run analyze           # Bundle analyzer
npm run type-check:watch  # TypeScript watch mode
```

---

**Nota**: Este documento deve ser mantido atualizado conforme a evolução do projeto. Sempre verificar a conformidade com os padrões antes de fazer commits.