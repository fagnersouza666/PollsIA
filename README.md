# 🚀 PollsIA - Sistema de Gestão de Pools Solana

Sistema automatizado de gestão e otimização de pools de liquidez na blockchain Solana com integração em tempo real ao Raydium DEX.

## 📋 Visão Geral

PollsIA é uma plataforma completa para descoberta, análise e gestão de pools de liquidez na blockchain Solana. Integra dados em tempo real de mais de 695.000 pools do Raydium DEX, fornecendo analytics avançados e oportunidades de investimento otimizadas.

### ✨ Características Principais

- **🔗 Solana 2.0**: Integração moderna com `@solana/rpc`, `@solana/keys`
- **📊 Dados em Tempo Real**: Integração direta com Raydium DEX (695k+ pools)
- **🤖 Analytics Avançado**: Métricas de performance e análise de riscos
- **👛 Phantom Wallet**: Conexão nativa com carteira Phantom
- **⚡ Performance**: WebSockets para atualizações em tempo real
- **📚 Documentação Swagger**: API REST completamente documentada

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify + TypeScript
- **Blockchain**: Solana 2.0 (mainnet-beta)
- **Banco de Dados**: PostgreSQL + Redis
- **APIs Externas**: Raydium DEX, CoinGecko, Solana RPC
- **Documentação**: Swagger/OpenAPI 3.0

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Gráficos**: Chart.js
- **Wallet**: Phantom Wallet Integration

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose
- Git

### 1. Clone o Repositório
```bash
git clone https://github.com/pollsia/pollsia.git
cd pollsia
```

### 2. Configuração de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as variáveis necessárias
nano .env
```

### 3. Instalação com Docker (Recomendado)
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

### 4. Instalação Manual

#### Backend
```bash
cd backend
npm install --legacy-peer-deps
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
npm start
```

## 📚 Documentação da API

### Swagger UI
A API está completamente documentada com Swagger/OpenAPI 3.0:

- **Swagger UI**: http://localhost:3001/docs
- **OpenAPI JSON**: http://localhost:3001/docs/json
- **Documentação Detalhada**: [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

### Principais Endpoints

| Grupo | Endpoint | Descrição |
|-------|----------|-----------|
| **Health** | `GET /health` | Status da API |
| **Pools** | `GET /api/pools/discover` | Descobrir pools otimizados |
| **Pools** | `GET /api/pools/rankings` | Rankings de pools |
| **Pools** | `GET /api/pools/{id}/analysis` | Análise detalhada de pool |
| **Wallet** | `POST /api/wallet/connect` | Conectar carteira |
| **Wallet** | `GET /api/wallet/{key}/portfolio` | Portfólio da carteira |
| **Wallet** | `GET /api/wallet/{key}/positions` | Posições ativas |
| **Analytics** | `GET /api/analytics/market-overview` | Visão geral do mercado |
| **Analytics** | `GET /api/analytics/opportunities` | Oportunidades de investimento |
| **Analytics** | `GET /api/analytics/performance` | Análise de performance |

### Rate Limits
| Grupo de Endpoints | Limite | Janela |
|-------------------|--------|--------|
| `/api/pools/*` | 60 req | 1 minuto |
| `/api/wallet/*` | 120 req | 1 minuto |
| `/api/analytics/*` | 30 req | 1 minuto |

## 🔧 Desenvolvimento

### Comandos Úteis

#### Backend
```bash
cd backend
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run lint       # Linting
npm run test       # Testes
```

#### Frontend
```bash
cd frontend
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run lint       # Linting
npm run test       # Testes
```

### Estrutura do Projeto
```
pollsia/
├── backend/                 # API REST + Swagger
│   ├── src/
│   │   ├── config/         # Configurações (Swagger, ENV)
│   │   ├── routes/         # Endpoints da API
│   │   ├── services/       # Lógica de negócio
│   │   ├── schemas/        # Validação Zod
│   │   └── types/          # TypeScript types
│   ├── API_DOCUMENTATION.md # Documentação completa
│   └── package.json
├── frontend/               # Interface Next.js
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # Componentes React
│   │   └── utils/         # Utilitários
│   └── package.json
├── docker-compose.yml      # Orquestração Docker
└── README.md              # Este arquivo
```

## 🔗 Integrações

### Solana Blockchain
- **RPC**: Mainnet-beta oficial
- **Bibliotecas**: `@solana/rpc`, `@solana/keys`, `@solana-program/token`
- **Carteiras**: Phantom Wallet

### APIs Externas
- **Raydium DEX**: Dados de pools em tempo real
- **CoinGecko**: Preços e dados de mercado
- **Solana RPC**: Dados on-chain

## 📊 Exemplos de Uso

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

## 🐛 Troubleshooting

### Problemas Comuns

1. **Dependências do Solana**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Porta 3001 em uso**
   ```bash
   # Verificar processo usando a porta
   lsof -i :3001
   # Ou alterar PORT no .env
   ```

3. **Problemas de CORS**
   - Verifique se `FRONTEND_URL` está configurado corretamente no `.env`

4. **Timeout na Solana RPC**
   - Aumente o timeout nas configurações
   - Verifique conectividade com a rede Solana

## 🚀 Deploy

### Produção com Docker
```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente de Produção
```bash
NODE_ENV=production
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
DATABASE_URL=postgresql://user:pass@host:5432/pollsia
REDIS_URL=redis://host:6379
FRONTEND_URL=https://pollsia.com
```

## 📈 Roadmap

- [x] **v1.0**: API REST básica com Swagger
- [x] **v1.1**: Integração Raydium DEX
- [x] **v1.2**: Phantom Wallet
- [ ] **v2.0**: WebSockets em tempo real
- [ ] **v2.1**: Machine Learning para predições
- [ ] **v2.2**: Mobile App (React Native)
- [ ] **v3.0**: Multi-chain (Ethereum, BSC)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `chore:` Tarefas de manutenção
- `refactor:` Refatoração de código

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/pollsia/pollsia/issues)
- **Email**: dev@pollsia.com
- **Documentação**: [API Docs](backend/API_DOCUMENTATION.md)
- **Swagger UI**: http://localhost:3001/docs

## 🙏 Agradecimentos

- **Solana Foundation**: Pela blockchain e documentação
- **Raydium Protocol**: Pelos dados de pools
- **Phantom Wallet**: Pela integração de carteira
- **Fastify**: Pelo framework web performático
- **Next.js**: Pelo framework frontend

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Status**: Documentação Swagger Completa ✅