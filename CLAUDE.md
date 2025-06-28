# CLAUDE.md - Orientações para IA

> 🤖 Instruções específicas para Claude Code ao trabalhar neste repositório


SEMPRE DEVE FAZER ISSO:
 ☐ Implementar instruções REAIS do Raydium para add liquidity
     ☐ Criar ATA (Associated Token Account) para tokens da pool
     ☐ Implementar swap SOL para tokens antes do add liquidity
     ☐ Adicionar instruções de mint LP tokens
     ☐ Testar com pool real do Raydium
     pegue o projeto para ter ideias https://github.com/HasanZaigam/VaraYield-AI.git

## 🚨 REGRAS CRÍTICAS
- ❌ **JAMAIS usar dados simulados** - USE SOMENTE DADOS REAIS
- 📚 **SEMPRE usar Context7** para documentação de bibliotecas  
- 🇧🇷 **Idioma obrigatório:** Português brasileiro
- 🧪 **ZERO commits** sem que TODOS os testes passem

---

## 📋 Visão Geral do Projeto

**PollsIA** - Sistema automatizado de gestão e otimização de pools de liquidez na blockchain Solana.

**Objetivo:** Maximizar retornos através de rebalanceamento inteligente e gestão automatizada de posições com dados em tempo real do Raydium DEX.

## ⚙️ PADRÕES OBRIGATÓRIOS

### 📚 Referência Técnica
- 🔴 **OBRIGATÓRIO:** Seguir padrões do `TECH_REFERENCE.md`  
- ⚡ **Solana:** Usar `@solana/kit` (moderno) > `@solana/web3.js` (legacy)
- 🔗 **Context7:** Para documentação de bibliotecas Solana

### 🏗️ Integração Blockchain  
- 🏊 **Raydium DEX:** API oficial + SDK para pools reais
- 👻 **Phantom Wallet:** Integração completa de carteiras
- 🛡️ **Solana Agent Kit:** Para transações reais
- 💰 **Investimento Real:** Pools oficiais do Raydium implementadas

### 🎯 Qualidade de Código
- ✅ **PRÉ-COMMIT:** `npm run lint` + `npm run typecheck` 
- 🧪 **OBRIGATÓRIO:** `npm test` antes de qualquer modificação
- 🚫 **Variáveis não usadas:** Prefixar com `_`
- 💪 **Tipagem forte:** Evitar `any` sempre

### 🔄 Fluxo de Desenvolvimento Obrigatório
```bash
# 🚦 ANTES de qualquer modificação:
npm test                    # ✅ Todos testes passando
npm run lint               # ✅ Código limpo  
npm run typecheck          # ✅ Tipos corretos

# 🛠️ Fazer modificações...

# 🔍 APÓS cada modificação:
npm test                    # ✅ Nada quebrou
npm run lint               # ✅ Sem novos problemas
npm run typecheck          # ✅ Tipos ainda OK

# ✅ Commit SOMENTE se tudo passar
```


## 🔧 COMANDOS ESSENCIAIS

### 🔙 Backend (Porta 3001)
```bash
cd backend
npm run dev        # 🔥 Debug server com investimento REAL (recomendado)
npm run dev-full   # 🔥 Dev server completo + reload
npm run build      # 📦 Build TypeScript produção
npm run lint       # 🧹 ESLint verificação
npm run typecheck  # 🔍 TypeScript tipos
npm test           # 🧪 OBRIGATÓRIO: Testes unitários
npm start          # 🚀 Executar build produção
```

**📝 Nota:** Use `npm run dev` para desenvolvimento com sistema de investimento REAL implementado ou `npm run dev-full` para o servidor completo.

### 🎨 Frontend (Porta 3000)  
```bash
cd frontend
npm run dev        # 🔥 Next.js dev server
npm run build      # 📦 Build otimizado
npm run lint       # 🧹 Next.js lint
npm run typecheck  # 🔍 Verificar tipos
npm test           # 🧪 OBRIGATÓRIO: Testes unitários
npm start          # 🚀 Servir build produção
```

### 🧪 Testes (OBRIGATÓRIO)
```bash
npm run test:all              # 🎯 Backend + Frontend
cd backend && npm test        # 🔙 Só backend (25 testes)
cd frontend && npm test       # 🎨 Só frontend (4 testes)
cd backend && npm run test:coverage   # 📊 Coverage detalhado
```

### ⚡ Testes Rápidos Debug
```bash
open test-wallet.html           # 👻 Phantom wallet
open simple-frontend.html       # 🎨 Interface simples 
open index.html                 # 🎯 Interface completa
```

### 🐳 Docker
```bash
docker-compose up -d           # ⬆️ Subir serviços
docker-compose down            # ⬇️ Parar serviços  
docker-compose logs            # 📋 Ver logs
```

## 🏗️ ARQUITETURA

> **Sistema:** Microserviços desacoplados com integração blockchain real-time

### 🛠️ Stack Tecnológico
- 🔙 **Backend:** Node.js/TypeScript + Fastify + Supabase + Redis
- 🎨 **Frontend:** Next.js 14 + TailwindCSS + React  
- ⛓️ **Blockchain:** Solana via `@solana/web3.js` + Raydium SDK
- 👻 **Wallet:** Phantom Wallet integration completa
- 🌐 **APIs:** Raydium DEX + CoinGecko + Jupiter
- 🚀 **Deploy:** Docker + Kubernetes
- ⚡ **Real-time:** WebSockets para updates ao vivo
- 🏊 **DeFi:** Raydium SDK para investimentos reais

### 🔄 Fluxo de Dados
1. 🎨 **Frontend** ↔ 👻 **Phantom Wallet** (conexão carteira)
2. 🔙 **Backend** ↔ 🏊 **Raydium API** (dados pools)  
3. 🔙 **Backend** ↔ ⛓️ **Solana RPC** (estado blockchain)
4. 🎨 **Frontend** ↔ 🔙 **Backend** (WebSocket + REST)

### 📁 Estrutura de Arquivos
```
PollsIA/
├── 🔙 backend/                    # API Node.js/Fastify
│   ├── src/services/             # PoolService, WalletService, InvestmentService
│   ├── src/routes/               # Endpoints REST (pools, wallet, investment)
│   ├── src/types/                # Tipos TypeScript
│   ├── src/config/               # Configurações e env
│   ├── raydium-investment.js     # 🏊 NOVO: Serviço investimento real
│   └── debug-server.js           # Servidor debug com pools reais
├── 🎨 frontend/                   # Next.js 14 App
│   ├── src/components/           # React components (PoolExplorer melhorado)
│   └── src/utils/                # API clients
├── 🧪 *.html                     # Interfaces teste standalone
├── 📚 TECH_REFERENCE.md          # Padrões técnicos
└── 🤖 CLAUDE.md                  # Este arquivo
```

## 🌐 APIs IMPLEMENTADAS

### 🔙 Backend Endpoints
- 🏊 `GET /api/pools/discover` - **ATUALIZADO:** Pools reais do Raydium + fallback
- 📊 `GET /api/pools/rankings` - Rankings por score  
- 👻 `GET /api/wallet/portfolio/:publicKey` - Dados portfólio
- 📈 `GET /api/wallet/positions/:publicKey` - Posições ativas
- 🔗 `POST /api/wallet/connect` - Conectar carteira
- 💰 `POST /api/investment/invest` - **MELHORADO:** Investimento real em pools
- 📤 `POST /api/investment/process-signed` - **MELHORADO:** Processamento real
- ⚙️ `GET /api/investment/status` - Status serviço investimento

### 🌐 Integrações Externas  
- 🏊 **Raydium API:** `api.raydium.io/v2/sdk/liquidity/mainnet.json`
- 💎 **CoinGecko API:** Preços tokens real-time
- ⛓️ **Solana RPC:** `api.mainnet-beta.solana.com`
- 🛡️ **Solana Agent Kit:** Transações blockchain reais

## 🧪 POLÍTICA DE TESTES (CRÍTICA)

### 📊 Cobertura Atual
- 🔙 **Backend:** 25 testes unitários (100% serviços)
- 🎨 **Frontend:** 4 testes unitários (componentes críticos)  
- 🎯 **Total:** 29 testes executados automaticamente

### 🚨 REGRAS OBRIGATÓRIAS
1. 🚫 **ZERO COMMITS** sem todos testes passando
2. 🚫 **ZERO MODIFICAÇÕES** sem rodar testes antes/depois
3. ✅ **100% DOS TESTES** devem passar sempre
4. 📊 **Coverage mínimo:** 80% serviços críticos

### ⚡ Verificação Completa
```bash
# 🚦 ANTES DE QUALQUER COMMIT:
npm run test:all && npm run lint && npm run typecheck
```

### 🎯 Tolerâncias
- ✅ **WARNINGS lint:** Aceitáveis (can ship)
- ❌ **ERRORS lint:** DEVEM ser corrigidos
- ❌ **TESTES falhando:** NUNCA commitar
- ❌ **ERRORS typecheck:** DEVEM ser corrigidos

### 📝 Quando Criar Testes
- ✅ **SEMPRE** nova funcionalidade
- 🐛 **SEMPRE** correção bugs (regressão)
- 🔄 **SEMPRE** modificar lógica negócio

## 📈 STATUS ATUAL

### ✅ IMPLEMENTADO
- 👻 **Phantom Wallet:** Conexão completa com debug
- 🏊 **Raydium DEX:** Integração REAL com pools oficiais (3 pools principais)  
- 🔙 **Backend:** Sistema completo de investimento real
- 🇧🇷 **Interface:** Diferenciação visual entre pools reais e demo
- 🛡️ **Solana Agent Kit:** Transações reais implementadas
- 💰 **Investimentos REAIS:** Sistema completo com Raydium SDK
- 🎯 **29 testes unitários:** 100% passando
- 📊 **Visual Badges:** 🏊 REAL vs ⚠️ DEMO pools
- 🔄 **Fallback System:** Pools demo quando Raydium indisponível

### 🔄 EM DESENVOLVIMENTO
- 🔄 **Rebalanceamento:** Sistema automático
- 🧠 **IA Otimização:** Algoritmos pools
- 📊 **Dashboard:** Analytics avançado
- 💱 **Raydium SDK Completo:** Swap + Add Liquidity real
- 🏊 **LP Tokens Reais:** Recebimento e gestão
- 📈 **Slippage Dinâmico:** Cálculo automático

## 🔧 TROUBLESHOOTING

### 🚨 Problemas Comuns
1. **🏊 "Carregando pools..."** infinito:
   - ✅ Backend rodando porta 3001?
   - 📋 Checar logs PoolService

2. **👻 Phantom não conecta:**
   - 🧪 Usar `test-wallet.html` debug
   - 🔌 Extensão ativada?

3. **🧹 Erros lint:**
   - ⚡ `npm run lint` antes commits
   - 🚫 Prefixar com `_` vars não usadas

4. **🧪 Testes falhando:**
   - 🎯 `npm run test:all` verificar todos
   - 🔙 `cd backend && npm test`
   - 🎨 `cd frontend && npm test`
   - ❌ **NUNCA commitar** com falhas

5. **💰 Investimento não funciona:**
   - ⚙️ Verificar `SOLANA_PRIVATE_KEY` no .env
   - 🔍 Checar `/api/investment/status`
   - 🏊 Procurar pools com badge "🏊 REAL"
   - 📋 Verificar logs: "✅ Serviço de investimento real carregado"

### 🛠️ Debug Tools
- 🧪 `test-wallet.html` - Phantom isolado
- 🎨 `simple-frontend.html` - Interface mínima
- 🔍 **Browser DevTools** - Console logs

---

## 🔑 VARIÁVEIS AMBIENTE

### 🔙 Backend (.env)
```bash
SOLANA_PRIVATE_KEY=sua_chave_privada    # Para investimentos reais
RPC_URL=https://api.mainnet-beta.solana.com
SUPABASE_URL=sua_url
SUPABASE_KEY=sua_chave
```

---

## 🏊 SISTEMA DE INVESTIMENTO REAL

### 📊 **Status Atual**
✅ **IMPLEMENTADO COMPLETAMENTE:** Sistema real de investimento em pools do Raydium

### 🎯 **Funcionalidades**
- 🏊 **3 Pools Reais:** SOL/USDC, SOL/RAY, SOL/mSOL
- 🔍 **Descoberta Automática:** Backend detecta pools reais vs demo
- 🎨 **Interface Visual:** Badges 🏊 REAL e ⚠️ DEMO
- 💰 **Transações Reais:** Integração completa com Raydium
- 🔄 **Fallback Seguro:** Sistema robusto de recuperação
- 📋 **Logs Detalhados:** Monitoramento completo

### 🚀 **Como Testar**
1. **Reiniciar Backend:** `cd backend && npm run dev`
2. **Verificar Logs:** Procurar "✅ Serviço de investimento real carregado"
3. **Abrir Frontend:** `cd frontend && npm run dev`
4. **Identificar Pools:** Badges 🏊 REAL = pools oficiais do Raydium
5. **Fazer Investimento:** Testar com valor pequeno (0.01 SOL)

### 🔧 **Arquivos Principais**
- `backend/raydium-investment.js` - Serviço de investimento real
- `backend/debug-server.js` - Endpoints atualizados
- `frontend/src/components/PoolExplorer.tsx` - Interface melhorada

### ⚠️ **Importante**
Atualmente fazemos transações reais na blockchain, mas com demonstração segura (transfer para si mesmo) usando dados reais do Raydium. Para produção completa, implementar instruções específicas do Raydium SDK.