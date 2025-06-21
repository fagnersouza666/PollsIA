# PollsIA - Otimizador de Pools Solana

Sistema automatizado de gestão e otimização de pools de liquidez na blockchain Solana, maximizando retornos através de rebalanceamento inteligente e gestão automatizada de posições com dados em tempo real do Raydium DEX.

## ✨ Características Principais

- **🚀 Padrões Modernos Solana**: Integração com Solana 2.0 usando `@solana/rpc`, `@solana/keys` e `@solana-program/token`
- **🔗 Phantom Wallet**: Conexão nativa com carteira Phantom usando APIs modernas
- **📊 Dados em Tempo Real**: Integração direta com Raydium DEX API (695k+ pools)
- **🤖 Gestão Automatizada**: Algoritmos de otimização de liquidez em desenvolvimento
- **🌐 Interface Multilíngue**: Todos os textos em português brasileiro
- **⚡ Performance**: WebSockets para atualizações em tempo real

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+ com TypeScript
- **Framework**: Fastify (alta performance)
- **Blockchain**: Solana 2.0 (`@solana/rpc`, `@solana/keys`)
- **Banco de Dados**: PostgreSQL + Redis
- **Jobs**: BullMQ para processamento em background

### Frontend
- **Framework**: Next.js 14 com App Router
- **UI**: TailwindCSS + Lucide Icons + Radix UI
- **Estado**: Zustand + TanStack Query
- **Carteira**: Phantom Wallet Adapter + APIs nativas

### Blockchain & APIs
- **Solana RPC**: Endpoints mainnet-beta oficiais
- **Raydium DEX**: API v2 para dados de pools
- **CoinGecko**: Preços de tokens em tempo real
- **Jupiter**: Agregador de swaps (planejado)

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ (recomendado 20+)
- npm ou yarn
- PostgreSQL 14+
- Redis 6+

### Backend (Porta 3001)
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run dev        # Desenvolvimento com hot reload
npm run build      # Build para produção
npm run lint       # Verificar código
npm run typecheck  # Verificar tipos TypeScript
```

### Frontend (Porta 3000)
```bash
cd frontend
npm install
npm run dev        # Servidor de desenvolvimento
npm run build      # Build otimizado
npm run lint       # Next.js lint
npm run typecheck  # Verificar tipos
```

### Docker (Recomendado)
```bash
docker-compose up -d  # Subir todos os serviços
docker-compose logs   # Ver logs dos containers
docker-compose down   # Parar serviços
```

## 🚀 Uso Rápido

### Testes de Conectividade
```bash
# Teste de carteira Phantom (debug completo)
open test-wallet.html

# Interface simples funcional
open simple-frontend.html

# Interface completa
open index.html
```

### Desenvolvimento
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Terminal 3 - Logs em tempo real
docker-compose logs -f
```

## 📡 APIs Implementadas

### Endpoints Backend
- `GET /api/pools/discover` - Descobrir pools do Raydium
- `GET /api/pools/rankings` - Rankings por performance
- `GET /api/wallet/portfolio/:publicKey` - Dados do portfólio
- `GET /api/wallet/positions/:publicKey` - Posições ativas
- `POST /api/wallet/connect` - Conectar carteira Phantom

### Integrações Externas
- **Raydium API**: `https://api.raydium.io/v2/sdk/liquidity/mainnet.json`
- **CoinGecko**: Preços USD em tempo real
- **Solana RPC**: `https://api.mainnet-beta.solana.com`

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```bash
# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/pollsia
REDIS_URL=redis://localhost:6379

# APIs Externas
COINGECKO_API_KEY=your_key_here
RAYDIUM_API_URL=https://api.raydium.io/v2

# Aplicação
PORT=3001
NODE_ENV=development
```

## 📊 Status Atual

### ✅ Implementado
- [x] Conexão com Phantom Wallet (debug completo)
- [x] Integração real com Raydium DEX (695k+ pools)
- [x] Backend funcional com dados em tempo real
- [x] Interface traduzida para português
- [x] Padrões modernos Solana 2.0
- [x] WalletService com RPC moderno
- [x] PhantomWalletService nativo

### 🔄 Em Desenvolvimento
- [ ] Sistema de rebalanceamento automático
- [ ] Algoritmos de otimização de pools
- [ ] Dashboard avançado de analytics
- [ ] Integração com Jupiter para swaps
- [ ] Sistema de notificações

### 🎯 Roadmap
- [ ] Mobile app (React Native)
- [ ] Suporte a mais DEXs (Orca, Jupiter)
- [ ] Estratégias de yield farming
- [ ] API pública para terceiros

## 🛠️ Troubleshooting

### Problemas Comuns

**1. "Carregando pools do Raydium..." infinito**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/pools/discover
# Checar logs do PoolService
docker-compose logs backend
```

**2. Phantom não conecta**
```bash
# Usar teste isolado
open test-wallet.html
# Verificar console do navegador
# Confirmar se extensão está ativada
```

**3. Erros de lint**
```bash
# Backend
cd backend && npm run lint
# Prefixar variáveis não usadas com _
# Evitar uso de 'any'

# Frontend
cd frontend && npm run lint
```

**4. Conflitos de dependências Solana**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Debug Tools
- `test-wallet.html` - Teste isolado do Phantom
- `simple-frontend.html` - Interface mínima funcional
- Browser DevTools - Console logs detalhados
- `docker-compose logs` - Logs dos serviços

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feat/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feat/nova-feature`)
5. Abra um Pull Request

### Padrões de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `chore:` - Tarefas de manutenção
- `refactor:` - Refatoração de código

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/pollsia/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/pollsia/discussions)

---

**Versão Atual**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Status**: Em desenvolvimento ativo 🚀