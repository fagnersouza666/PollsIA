# PollsIA - Otimizador de Pools Solana

Plataforma automatizada de otimização de rendimento DeFi para o ecossistema Solana.

## Funcionalidades

- **Descoberta Automática de Pools**: Escaneia as melhores oportunidades de yield farming no Raydium e outras DEXs
- **Gestão de Portfólio**: Acompanhamento e análise de portfólio em tempo real
- **Gestão de Risco**: Avaliação avançada de risco e rebalanceamento automatizado
- **Analytics de Performance**: Acompanhamento abrangente de performance com gráficos e métricas
- **Responsivo Mobile**: Funciona perfeitamente em desktop e dispositivos móveis

## Stack Tecnológica

### Backend
- **Runtime**: Node.js com TypeScript
- **Framework**: Fastify
- **Banco de Dados**: PostgreSQL + Redis
- **Blockchain**: @solana/web3.js
- **Filas**: BullMQ

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS + Radix UI
- **Estado**: Zustand + React Query
- **Wallet**: Solana Wallet Adapter
- **Gráficos**: Recharts

## Começando

### Pré-requisitos

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL
- Redis

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd PollsIA
```

2. Copie as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

4. Instale as dependências:
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

5. Inicie os servidores de desenvolvimento:
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Configuração Manual (sem Docker)

1. Inicie os serviços PostgreSQL e Redis localmente

2. Instale as dependências do backend:
```bash
cd backend
npm install
npm run dev
```

3. Instale as dependências do frontend:
```bash
cd frontend
npm install
npm run dev
```

## Estrutura do Projeto

```
├── backend/                 # Servidor API Node.js
│   ├── src/
│   │   ├── controllers/    # Manipuladores de rotas
│   │   ├── services/       # Lógica de negócio
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middleware customizado
│   │   ├── types/          # Tipos TypeScript
│   │   ├── utils/          # Funções utilitárias
│   │   └── config/         # Configuração
│   ├── tests/              # Testes do backend
│   └── docs/               # Documentação da API
├── frontend/               # App React Next.js
│   ├── src/
│   │   ├── app/            # Diretório app do Next.js
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Hooks customizados
│   │   ├── store/          # Gerenciamento de estado
│   │   ├── utils/          # Funções utilitárias
│   │   ├── types/          # Tipos TypeScript
│   │   └── styles/         # Estilos CSS
│   ├── public/             # Assets estáticos
│   └── tests/              # Testes do frontend
├── shared/                 # Código compartilhado
│   ├── types/              # Tipos TypeScript compartilhados
│   └── utils/              # Utilitários compartilhados
├── docs/                   # Documentação
├── scripts/                # Scripts de deployment
└── docker-compose.yml      # Serviços Docker
```

## Endpoints da API

### Pools
- `GET /api/pools/discover` - Descobrir pools disponíveis
- `GET /api/pools/rankings` - Obter rankings de pools
- `GET /api/pools/:id/analysis` - Obter análise detalhada do pool

### Wallet
- `POST /api/wallet/connect` - Conectar carteira
- `GET /api/wallet/portfolio/:publicKey` - Obter visão geral do portfólio
- `GET /api/wallet/positions/:publicKey` - Obter posições ativas

### Analytics
- `GET /api/analytics/performance/:publicKey` - Obter métricas de performance
- `GET /api/analytics/market-overview` - Obter visão geral do mercado
- `GET /api/analytics/opportunities` - Obter oportunidades de yield

## Desenvolvimento

### Comandos do Backend
```bash
npm run dev        # Iniciar servidor de desenvolvimento
npm run build      # Build para produção
npm run start      # Iniciar servidor de produção
npm run test       # Executar testes
npm run lint       # Executar linter
npm run typecheck  # Verificação de tipos
```

### Comandos do Frontend
```bash
npm run dev        # Iniciar servidor de desenvolvimento
npm run build      # Build para produção
npm run start      # Iniciar servidor de produção
npm run lint       # Executar linter
npm run typecheck  # Verificação de tipos
```

## Deploy

A aplicação está containerizada e pode ser deployada usando Docker:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Variáveis de Ambiente

### Backend
```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/pollsia
REDIS_URL=redis://localhost:6379
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change-this-to-a-secure-32-character-secret-in-production
```

### Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

## Arquitetura

**Sistema:** Microserviços desacoplados
- **Backend:** Node.js/TypeScript + Fastify + PostgreSQL + Redis
- **Frontend:** Next.js 14 + TailwindCSS + Solana Wallet Adapter
- **Blockchain:** Integração com Solana via @solana/web3.js
- **Deploy:** Docker + Kubernetes
- **Real-time:** WebSockets para atualizações em tempo real

## Recursos de Segurança

- ✅ Validação de entrada com Zod
- ✅ Tratamento de erros centralizado
- ✅ Verificação de assinatura de carteira
- ✅ Variáveis de ambiente para dados sensíveis
- ✅ CORS configurado adequadamente
- ✅ Rate limiting (planejado)

## Roadmap

### Fase 1 - MVP ✅
- [x] Setup básico do projeto
- [x] API REST básica
- [x] Interface de usuário fundamental
- [x] Integração com carteira Solana
- [x] Descoberta básica de pools

### Fase 2 - Core Features 🚧
- [ ] Integração real com Raydium API
- [ ] Sistema de rebalanceamento automatizado
- [ ] Analytics avançadas de performance
- [ ] Gestão de risco implementada
- [ ] WebSockets para atualizações em tempo real

### Fase 3 - Advanced Features 📋
- [ ] Machine Learning para recomendações
- [ ] Suporte a múltiplas DEXs
- [ ] Estratégias de yield farming avançadas
- [ ] Dashboard de analytics aprimorado
- [ ] Sistema de notificações

### Fase 4 - Scale & Optimize 📋
- [ ] Otimizações de performance
- [ ] Testes automatizados completos
- [ ] Monitoramento e logging avançado
- [ ] Deploy em produção
- [ ] Documentação completa da API

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça suas alterações
4. Adicione testes se aplicável
5. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
6. Push para a branch (`git push origin feature/AmazingFeature`)
7. Abra um Pull Request

## Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através dos canais oficiais.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Versão Atual:** 1.0.0  
**Última Atualização:** Janeiro 2024  
**Status:** Em Desenvolvimento Ativo

> ⚠️ **Aviso**: Este projeto está em desenvolvimento ativo. Use por sua própria conta e risco em ambientes de produção.