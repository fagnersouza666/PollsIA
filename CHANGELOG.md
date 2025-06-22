# Changelog

Todas as mudanças importantes deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.1] - 2025-06-22

### 🐛 Corrigido
- **Schema Validation Error**: Resolvido erro crítico do Fastify
  - Removidas todas as propriedades `example` dos schemas JSON
  - Arquivos corrigidos: `backend/src/routes/wallet.ts`, `pools.ts`, `analytics.ts`
  - Erro resolvido: `Failed building the validation schema for GET: /api/wallet/:publicKey/portfolio, due to error strict mode: unknown keyword: "example"`
  - Backend agora inicia sem erros de validação
  - Todas as rotas da API funcionando corretamente

### 📚 Documentação
- **README.md**: Adicionado seção de troubleshooting com a correção recente
- **CHANGELOG.md**: Documentado a correção do schema validation

## [1.0.0] - 2024-12-21

### ✨ Adicionado
- **Migração para Solana 2.0**: Implementação completa dos padrões modernos
  - Migrado de `@solana/web3.js` v1 para v2.0-preview.4
  - Adicionado `@solana/rpc`, `@solana/keys`, `@solana-program/token`
  - Atualizado `WalletService` para usar `createSolanaRpc` e `address` modernos
- **PhantomWalletService**: Serviço nativo para integração com Phantom Wallet
  - Métodos: `connect`, `disconnect`, `signTransaction`, `isPhantomInstalled`
  - Event listeners: `onConnect`, `onDisconnect`, `onAccountChanged`
  - Instância singleton exportada
- **Tipos TypeScript Modernos**: 
  - Interface `SolanaWallet` com tipos corretos
  - Expandido interface do Phantom para todos os métodos necessários
  - Removido uso de `any` desnecessário conforme CLAUDE.md

### 🔧 Alterado
- **Backend**: 
  - Corrigido imports não utilizados (`Address`, `findAssociatedTokenPda`)
  - Melhorado tratamento de erros e logs em português
  - Atualizado métodos: `getBalance`, `getAccountInfo`, `getTokenAccountsByOwner`
- **Frontend**: 
  - Dashboard modernizado com novo `PhantomWalletService`
  - Adicionado verificação automática de conexão existente
  - Implementado listeners para eventos de carteira
  - Melhorado tratamento de estados de loading
- **Interface HTML**: 
  - Atualizado textos para mencionar `@solana/kit`
  - Melhorado visual com bordas coloridas nos cards
  - Adicionado indicador de status "Conectado"
  - Implementado botão de atualizar pools

### 🐛 Corrigido
- **Lint**: Resolvido todos os erros de lint relacionados a variáveis não utilizadas
- **Dependências**: Instalado dependências corretas com `--legacy-peer-deps`
- **Tipos**: Corrigido tipagem de `signer` de `any` para `unknown`

### 📚 Documentação
- **README.md**: Completamente reescrito com informações atualizadas
  - Adicionado seção de características principais
  - Documentado stack tecnológico completo
  - Incluído guias de instalação e uso
  - Adicionado troubleshooting detalhado
- **CHANGELOG.md**: Criado para registrar mudanças importantes
- **Comentários**: Todos os comentários traduzidos para português

### 🔒 Segurança
- **Padrões Modernos**: Migração para APIs mais seguras do Solana 2.0
- **Validação**: Melhorado validação de chaves públicas
- **Tratamento de Erros**: Implementado tratamento robusto de erros de conexão

### 📦 Dependências
- **Adicionado**:
  - `@solana/web3.js@^2.0.0-preview.4`
  - `@solana/rpc@^2.0.0-preview.4`
  - `@solana/keys@^2.0.0-preview.4`
  - `@solana-program/token@^0.4.0`
- **Removido**:
  - `@solana/kit@^1.0.0` (não existe)
- **Atualizado**:
  - Todas as dependências Solana para versões 2.0-preview.4

---

## Formato das Mudanças

### Tipos de Mudanças
- **✨ Adicionado** para novas funcionalidades
- **🔧 Alterado** para mudanças em funcionalidades existentes
- **🐛 Corrigido** para correções de bugs
- **🗑️ Removido** para funcionalidades removidas
- **🔒 Segurança** para correções de vulnerabilidades
- **📚 Documentação** para mudanças na documentação
- **📦 Dependências** para mudanças em dependências

### Convenções de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `chore:` - Tarefas de manutenção
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `style:` - Mudanças de formatação 