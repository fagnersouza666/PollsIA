# Arquitetura do PollsIA

## Visão Geral

O PollsIA é uma plataforma DeFi construída com arquitetura limpa (Clean Architecture) e Domain-Driven Design (DDD), seguindo os princípios SOLID e utilizando TypeScript tanto no frontend quanto no backend.

## Stack Tecnológica

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Arquitetura**: Clean Architecture + DDD
- **Dependency Injection**: InversifyJS
- **Error Handling**: Result Pattern
- **Database**: PostgreSQL
- **Cache**: Redis
- **Blockchain**: Solana Web3.js
- **Testing**: Jest
- **Validation**: Joi/Zod
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **UI Framework**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Wallet Integration**: Solana Wallet Adapter
- **Testing**: Jest + React Testing Library
- **Internationalization**: next-intl
- **Performance**: Virtual Lists, Code Splitting

## Estrutura de Diretórios

### Backend (`/backend`)

```
backend/
├── src/
│   ├── application/           # Camada de Aplicação
│   │   ├── commands/         # Commands (CQRS)
│   │   ├── queries/          # Queries (CQRS)
│   │   ├── use-cases/        # Use Cases
│   │   └── __tests__/        # Testes da aplicação
│   ├── domain/               # Camada de Domínio
│   │   ├── entities/         # Entidades de domínio
│   │   ├── repositories/     # Interfaces de repositórios
│   │   ├── services/         # Serviços de domínio
│   │   └── events/           # Eventos de domínio
│   ├── infrastructure/       # Camada de Infraestrutura
│   │   ├── config/           # Configurações
│   │   ├── database/         # Database setup
│   │   ├── repositories/     # Implementações de repositórios
│   │   ├── services/         # Serviços externos
│   │   └── middleware/       # Middlewares
│   ├── presentation/         # Camada de Apresentação
│   │   ├── controllers/      # Controllers
│   │   ├── routes/           # Rotas
│   │   ├── middleware/       # Middlewares de apresentação
│   │   └── dto/              # Data Transfer Objects
│   └── shared/               # Código compartilhado
│       ├── errors/           # Classes de erro
│       ├── interfaces/       # Interfaces compartilhadas
│       ├── types/            # Tipos TypeScript
│       ├── utils/            # Utilitários
│       └── result.ts         # Result Pattern
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Route group autenticado
│   │   ├── api/             # API Routes
│   │   ├── globals.css      # Estilos globais
│   │   ├── layout.tsx       # Layout raiz
│   │   └── page.tsx         # Página inicial
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes de UI
│   │   ├── forms/           # Componentes de formulário
│   │   └── layout/          # Componentes de layout
│   ├── hooks/               # Custom Hooks
│   │   ├── wallet/          # Hooks de carteira
│   │   ├── pools/           # Hooks de pools
│   │   └── api/             # Hooks de API
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── api/             # Cliente API
│   │   ├── i18n/            # Internacionalização
│   │   ├── utils/           # Utilitários
│   │   └── validations/     # Esquemas de validação
│   ├── store/               # Estado global (Zustand)
│   └── types/               # Tipos TypeScript
```

## Padrões Arquiteturais

### 1. Clean Architecture

A aplicação segue os princípios da Clean Architecture com as seguintes camadas:

1. **Domain** (Núcleo): Entidades, regras de negócio, interfaces
2. **Application**: Use cases, commands, queries
3. **Infrastructure**: Implementações concretas, banco de dados, APIs externas
4. **Presentation**: Controllers, rotas, DTOs

### 2. Domain-Driven Design (DDD)

- **Entities**: Objetos com identidade única
- **Value Objects**: Objetos imutáveis sem identidade
- **Aggregates**: Grupos de entidades relacionadas
- **Repositories**: Abstração para persistência
- **Domain Services**: Lógica de domínio que não pertence a uma entidade

### 3. CQRS (Command Query Responsibility Segregation)

- **Commands**: Operações que modificam estado
- **Queries**: Operações que leem dados
- **Handlers**: Processam commands e queries

### 4. Result Pattern

Utilizado para tratamento de erros sem exceptions:

```typescript
// Sucesso
const result = Result.ok(data);

// Erro
const result = Result.fail(new DomainError('VALIDATION_ERROR', 'Invalid data'));

// Verificação
if (result.isSuccess) {
  const data = result.getValue();
} else {
  const error = result.getError();
}
```

### 5. Dependency Injection

Utilizando InversifyJS para inversão de dependências:

```typescript
@injectable()
export class CreatePoolUseCase {
  constructor(
    @inject(TYPES.PoolRepository) private poolRepository: IPoolRepository,
    @inject(TYPES.Logger) private logger: Logger
  ) {}
}
```

## Fluxo de Dados

### Backend

1. **Request** → Controller (Presentation)
2. **Controller** → Use Case (Application)
3. **Use Case** → Repository/Service (Domain Interface)
4. **Repository** → Database (Infrastructure)
5. **Response** ← Controller ← Use Case ← Repository

### Frontend

1. **User Action** → Component
2. **Component** → Custom Hook
3. **Hook** → API Client
4. **API Client** → Backend API
5. **Response** → Hook → Component → UI Update

## Segurança

### Backend
- **Helmet**: Headers de segurança
- **CORS**: Configuração de CORS
- **Rate Limiting**: Limitação de requisições
- **Input Validation**: Validação de entrada
- **Error Handling**: Tratamento seguro de erros

### Frontend
- **CSP**: Content Security Policy
- **XSS Protection**: Proteção contra XSS
- **CSRF Protection**: Proteção contra CSRF
- **Secure Headers**: Headers de segurança

## Performance

### Backend
- **Redis Caching**: Cache de dados frequentes
- **Database Indexing**: Índices otimizados
- **Connection Pooling**: Pool de conexões
- **Compression**: Compressão gzip

### Frontend
- **Code Splitting**: Divisão de código
- **Lazy Loading**: Carregamento sob demanda
- **Virtual Lists**: Listas virtualizadas
- **Image Optimization**: Otimização de imagens
- **Memoization**: Memorização de componentes

## Monitoramento

- **Health Checks**: Verificações de saúde
- **Structured Logging**: Logs estruturados
- **Error Tracking**: Rastreamento de erros
- **Performance Metrics**: Métricas de performance

## Testes

### Backend
- **Unit Tests**: Testes unitários (Jest)
- **Integration Tests**: Testes de integração
- **E2E Tests**: Testes end-to-end

### Frontend
- **Unit Tests**: Testes de componentes
- **Integration Tests**: Testes de hooks
- **E2E Tests**: Testes de fluxo completo

## Deploy

### Desenvolvimento
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Produção
```bash
# Build e deploy completo
./scripts/deploy.sh production
```

## Contribuição

1. Siga os padrões estabelecidos
2. Escreva testes para novas funcionalidades
3. Mantenha a documentação atualizada
4. Use commits convencionais
5. Faça code review antes do merge

## Links Úteis

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Result Pattern](https://medium.com/@hugodesigns/the-result-pattern-a-functional-approach-to-error-handling-in-typescript-d7c8d3b8f8e5)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) 