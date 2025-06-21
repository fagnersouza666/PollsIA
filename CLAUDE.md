# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Projeto

PollsIA - Automatizar a gestão e otimização de pools de liquidez na rede Solana, maximizando retornos através de rebalanceamento inteligente e gestão automatizada de posições.

## Padrões do PROJETO
Seguir os padrões do documento TECH_REFERENCE.md

Todos textos sempre em Português


## Comandos de Desenvolvimento

### Backend
```bash
cd backend
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run lint       # Verificar código
npm run typecheck  # Verificar tipos
```

### Frontend
```bash
cd frontend
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run lint       # Verificar código
npm run typecheck  # Verificar tipos
```

### Docker
```bash
docker-compose up -d  # Subir todos os serviços
docker-compose down   # Parar todos os serviços
```

## Arquitetura

**Sistema:** Microserviços desacoplados
- **Backend:** Node.js/TypeScript + Fastify + PostgreSQL + Redis
- **Frontend:** Next.js 14 + TailwindCSS + Solana Wallet Adapter
- **Blockchain:** Integração com Solana via @solana/web3.js
- **Deploy:** Docker + Kubernetes
- **Real-time:** WebSockets para atualizações em tempo real

## Observações

- Este é um novo projeto - estrutura e comandos serão documentados conforme o desenvolvimento progride
- Atualize este arquivo ao adicionar ferramentas de build, frameworks de teste ou estabelecer padrões de código