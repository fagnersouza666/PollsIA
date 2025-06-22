# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Projeto

PollsIA - Sistema automatizado de gestão e otimização de pools de liquidez na blockchain Solana, maximizando retornos através de rebalanceamento inteligente e gestão automatizada de posições com dados em tempo real do Raydium DEX.

## Padrões do PROJETO

### Referência Técnica
- **OBRIGATÓRIO:** Seguir os padrões do documento `TECH_REFERENCE.md`
- **Solana:** Usar sempre `@solana/kit` (padrões modernos) em vez de `@solana/web3.js`
- **Idioma:** Todos textos sempre em Português

### Integração Blockchain
- **Raydium DEX:** API oficial para dados de pools em tempo real
- **Phantom Wallet:** Integração para conexão de carteiras
- **Context7:** Utilizar para obter padrões modernos do Solana

### Qualidade de Código
- **SEMPRE** executar `npm run lint` e `npm run typecheck` antes de commits
- **OBRIGATÓRIO** executar todos os testes unitários antes de qualquer modificação: `npm test`
- **NUNCA** deixar variáveis não utilizadas (prefixar com `_` se necessário)
- **EVITAR** uso de `any` - sempre tipar corretamente

### Fluxo de Desenvolvimento Obrigatório
```bash
# ANTES de qualquer modificação de código:
npm test                    # ✅ Verificar que todos os testes passam
npm run lint               # ✅ Verificar qualidade do código
npm run typecheck          # ✅ Verificar tipos TypeScript

# Fazer suas modificações...

# APÓS cada modificação:
npm test                    # ✅ Garantir que nada quebrou
npm run lint               # ✅ Verificar se há novos problemas
npm run typecheck          # ✅ Verificar tipos ainda estão corretos

# Só então fazer commit se tudo passar ✅
```


## Comandos de Desenvolvimento

### Backend (Porta 3001)
```bash
cd backend
npm run dev        # Servidor de desenvolvimento com reload automático
npm run build      # Build TypeScript para produção
npm run lint       # ESLint - verificar estilo de código
npm run typecheck  # TypeScript - verificar tipos
npm test           # ⚠️  OBRIGATÓRIO: Executar testes unitários
npm start          # Executar build de produção
```

### Frontend (Porta 3000)
```bash
cd frontend
npm run dev        # Next.js dev server
npm run build      # Build otimizado para produção
npm run lint       # Next.js lint
npm run typecheck  # Verificar tipos TypeScript
npm test           # ⚠️  OBRIGATÓRIO: Executar testes unitários
npm start          # Servir build de produção
```

### Testes Unitários (OBRIGATÓRIO)
```bash
# Executar todos os testes do projeto
npm run test:all              # Rodar backend + frontend

# Executar testes individuais
cd backend && npm test        # Só backend (25 testes)
cd frontend && npm test       # Só frontend (4 testes)

# Testes com coverage
cd backend && npm run test:coverage   # Coverage detalhado
```

### Testes Rápidos
```bash
# Teste de conectividade de carteira (standalone)
open test-wallet.html           # Browser - Phantom wallet
open simple-frontend.html       # Browser - Interface simples 
open index.html                 # Browser - Interface completa
```

### Docker
```bash
docker-compose up -d  # Subir todos os serviços
docker-compose down   # Parar todos os serviços
docker-compose logs   # Ver logs dos containers
```

## Arquitetura

**Sistema:** Microserviços desacoplados com integração blockchain em tempo real

### Stack Tecnológico
- **Backend:** Node.js/TypeScript + Fastify + SUPABASE + Redis
- **Frontend:** Next.js 14 + TailwindCSS + React
- **Blockchain:** Solana via `@solana/kit` (padrões modernos)
- **Wallet:** Phantom Wallet integration
- **APIs:** Raydium DEX + CoinGecko + Jupiter
- **Deploy:** Docker + Kubernetes
- **Real-time:** WebSockets para atualizações ao vivo

### Fluxo de Dados
1. **Frontend** ↔ **Phantom Wallet** (conexão de carteira)
2. **Backend** ↔ **Raydium API** (dados de pools)
3. **Backend** ↔ **Solana RPC** (estado da blockchain)
4. **Frontend** ↔ **Backend** (via WebSocket + REST)

### Estrutura de Arquivos
```
PollsIA/
├── backend/               # API Node.js/Fastify
│   ├── src/services/     # PoolService, WalletService, etc.
│   ├── src/routes/       # Endpoints REST
│   └── src/types/        # Tipos TypeScript
├── frontend/             # Next.js 14 App
│   ├── src/components/   # React components
│   └── src/utils/        # API clients
├── *.html               # Interfaces de teste standalone
├── TECH_REFERENCE.md    # Padrões e snippets técnicos
└── CLAUDE.md           # Este arquivo
```

## APIs Implementadas

### Backend Endpoints
- `GET /api/pools/discover` - Descobrir pools do Raydium
- `GET /api/pools/rankings` - Rankings de pools por score
- `GET /api/wallet/portfolio/:publicKey` - Dados do portfólio
- `GET /api/wallet/positions/:publicKey` - Posições ativas
- `POST /api/wallet/connect` - Conectar carteira

### Integrações Externas
- **Raydium API:** `https://api.raydium.io/v2/sdk/liquidity/mainnet.json`
- **CoinGecko API:** Preços de tokens em tempo real
- **Solana RPC:** `https://api.mainnet-beta.solana.com`

## 🧪 Política de Testes (OBRIGATÓRIA)

### Cobertura Atual
- **Backend:** 25 testes unitários (100% dos serviços)
- **Frontend:** 4 testes unitários (componentes críticos)
- **Total:** 29 testes executados automaticamente

### Regras Obrigatórias
1. **🚫 ZERO COMMITS** sem que todos os testes passem
2. **🚫 ZERO MODIFICAÇÕES** sem rodar testes antes e depois
3. **✅ 100% dos testes** devem passar sempre
4. **📊 Coverage mínimo:** 80% nos serviços críticos

### Comando de Verificação Completa
```bash
# RODAR ANTES DE QUALQUER COMMIT:
npm run check:all

# Ou comando rápido simplificado:
npm run test:all && npm run lint && npm run typecheck && echo "✅ Pronto para commit!"
```

### Tolerâncias de Qualidade
- **✅ WARNINGS de lint:** Aceitáveis (can ship)
- **❌ ERRORS de lint:** DEVEM ser corrigidos
- **❌ TESTES falhando:** NUNCA commitar
- **❌ ERRORS de typecheck:** DEVEM ser corrigidos

### Quando Criar Novos Testes
- **SEMPRE** ao adicionar nova funcionalidade
- **SEMPRE** ao corrigir bugs (teste da regressão)
- **SEMPRE** ao modificar lógica de negócio

## Status Atual

✅ **Implementado:**
- Conexão com Phantom Wallet (debug completo)
- Integração real com Raydium DEX (695k+ pools)
- Backend funcional com dados em tempo real
- Interface traduzida para português
- Padrões modernos Solana via Context7
- **29 testes unitários passando 100%**

🔄 **Em desenvolvimento:**
- Sistema de rebalanceamento automático
- Algoritmos de otimização de pools
- Dashboard avançado de analytics

## Troubleshooting

### Problemas Comuns
1. **"Carregando pools do Raydium..."** infinito:
   - Verificar se backend está rodando na porta 3001
   - Checar logs do PoolService

2. **Phantom não conecta:**
   - Usar `test-wallet.html` para debug detalhado
   - Verificar se extensão está ativada

3. **Erros de lint:**
   - Sempre executar `npm run lint` antes de commits
   - Prefixar variáveis não usadas com `_`

4. **Testes falhando:**
   - Executar `npm run test:all` para verificar todos
   - Backend: `cd backend && npm test`
   - Frontend: `cd frontend && npm test`
   - **NUNCA commitar** com testes falhando

### Debug Tools
- `test-wallet.html` - Teste isolado do Phantom
- `simple-frontend.html` - Interface mínima funcional
- Browser DevTools - Console logs detalhados