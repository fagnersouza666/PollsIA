# PollsIA - Projeto Solana DeFi

## Arquitetura do Projeto

### Stack Tecnológica
- **Backend**: Node.js + TypeScript + Fastify + MongoDB/PostgreSQL
- **Frontend**: React.js + Next.js + TypeScript + Tailwind CSS
- **Blockchain**: Solana + Raydium SDK + Phantom Wallet

### Estrutura de Pastas

```
PollsIA/
├── backend/                # Node.js API Server
│   ├── src/
│   │   ├── domain/         # Entidades e regras de negócio
│   │   ├── application/    # Casos de uso e comandos
│   │   ├── infrastructure/ # Implementações técnicas
│   │   ├── presentation/   # Controladores HTTP
│   │   └── shared/         # Utilitários compartilhados
│   └── tests/
├── frontend/               # React.js Interface
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # Context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utilitários
│   └── tests/
└── shared/                 # Código compartilhado
```

## Padrões de Desenvolvimento

### Node.js Backend - Seguir `claude_nodejs.md`

**SEMPRE**:
- ✅ TypeScript strict mode
- ✅ Dependency injection com containers
- ✅ async/await, nunca callbacks
- ✅ Error-first com Result pattern
- ✅ Validation com Zod
- ✅ Structured logging (Winston)
- ✅ Environment configs
- ✅ Jest para testes + supertest

**NUNCA**:
- ❌ JavaScript puro (sempre TypeScript)
- ❌ require() direto (use injeção)
- ❌ Callbacks (use async/await)
- ❌ throw Error genérico
- ❌ Validação manual
- ❌ console.log (use logger)
- ❌ Hardcoded values
- ❌ Testes sem mocks apropriados

### React.js Frontend - Seguir `claude_reactjs.md`

**SEMPRE**:
- ✅ TypeScript strict mode
- ✅ Functional components + hooks
- ✅ Custom hooks para lógica reutilizável
- ✅ Context + useReducer para state global
- ✅ Error boundaries + error handling
- ✅ Memoization apropriada (useMemo/useCallback)
- ✅ Zod para validação de forms
- ✅ React Query para server state

**NUNCA**:
- ❌ Class components (use functional)
- ❌ JavaScript puro (sempre TypeScript)
- ❌ Props drilling excessivo
- ❌ State diretamente mutado
- ❌ useEffect sem dependencies
- ❌ Inline functions em JSX
- ❌ Any type (use tipagem específica)
- ❌ Fetch direto (use React Query)

## Comandos do Projeto

### Desenvolvimento
```bash
# Instalar dependências
npm run install:all

# Desenvolvimento local
npm run dev:backend     # Backend na porta 3001
npm run dev:frontend    # Frontend na porta 3000

# Verificações completas
npm run check:all       # Lint + typecheck + tests
npm run pre-commit      # Verificação antes do commit
```

### Produção
```bash
# Build completo
npm run build:all

# Iniciar com Docker
npm start               # Docker Compose up
npm stop                # Docker Compose down
```

## Compliance Status

### Backend (Node.js) - 46% Compliant
- ✅ TypeScript strict mode
- ✅ Zod validation
- ✅ Environment config
- ❌ Dependency injection (InversifyJS)
- ❌ Result pattern
- ❌ Structured logging
- ❌ Clean architecture (DDD)
- ❌ Custom error hierarchy

### Frontend (React.js) - 31% Compliant
- ✅ TypeScript strict mode
- ✅ Functional components
- ✅ React Query setup
- ❌ Custom hooks organization
- ❌ Error boundaries
- ❌ Service layer abstraction
- ❌ Zod form validation
- ❌ Memoization patterns

## Próximos Passos

### Priority 1 (Crítico)
1. **Backend**: Implementar dependency injection com InversifyJS
2. **Backend**: Adicionar Result pattern e custom errors
3. **Backend**: Implementar structured logging com Winston
4. **Frontend**: Criar Error Boundaries
5. **Frontend**: Implementar service layer com abstrações

### Priority 2 (Alto)
1. **Backend**: Reestruturar para clean architecture
2. **Frontend**: Adicionar custom hooks para data fetching
3. **Frontend**: Implementar validação com Zod
4. **Ambos**: Melhorar cobertura de testes

### Scripts de Verificação
```bash
# Verificar compliance
npm run lint            # ESLint
npm run typecheck       # TypeScript
npm run test:all        # Jest tests
npm run check:all       # Todas verificações
```

## Instruções Importantes

### Para Claude Code
- Sempre seguir os padrões definidos em `claude_nodejs.md` e `claude_reactjs.md`
- Verificar compliance antes de qualquer commit
- Usar os scripts de verificação para garantir qualidade
- Priorizar refatoração arquitetural conforme análise de compliance

### Regras Gerais
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User
- Sempre executar `npm run check:all` antes de commits