# Resolução de Conflitos de Carteira

## Problema
Conflitos entre extensões de carteira (MetaMask vs Phantom) podem impedir a conexão correta com a Phantom Wallet.

## Soluções

### 1. Opção Rápida - Desativar MetaMask Temporariamente

#### Chrome/Edge:
1. Vá para `chrome://extensions/`
2. Encontre o MetaMask
3. Desative temporariamente
4. Recarregue a página do PollsIA
5. Conecte a Phantom Wallet

#### Firefox:
1. Vá para `about:addons`
2. Clique em "Extensões"
3. Encontre o MetaMask
4. Clique em "Desabilitar"
5. Recarregue a página do PollsIA
6. Conecte a Phantom Wallet

### 2. Opção Alternativa - Janela Privada/Incógnita

1. Abra uma janela privada/incógnita
2. Ative apenas a extensão Phantom
3. Acesse `http://localhost:3000/wallet`
4. Conecte normalmente

### 3. Verificação de Conflitos

O código já inclui detecção de conflitos. Abra o console do navegador (F12) e procure por:

```
🔍 Provedores de wallet detectados: {
  phantom: true/false,
  solflare: true/false,
  ethereum: object/undefined,
  metamask: true/false,
  hasConflict: true/false
}
```

### 4. Dicas Extras

- **Atualize as extensões**: Mantenha Phantom e MetaMask atualizados
- **Ordem de instalação**: Instale Phantom por último se ambas estiverem ativas
- **Configuração específica**: Use perfis diferentes do navegador para DeFi e Ethereum

## Código Implementado

O código já foi atualizado para:
- ✅ Detectar especificamente `window.phantom.solana.isPhantom`
- ✅ Evitar conflitos com `window.ethereum`
- ✅ Adicionar timeout para carregamento das extensões
- ✅ Debug logs para identificar conflitos

## Teste

Após seguir as soluções:
1. Acesse `http://localhost:3000/wallet`
2. Clique em "Conectar Carteira"
3. Selecione Phantom
4. Aprove a conexão na extensão
5. Visualize seus tokens e saldos

## Suporte

Se o problema persistir:
1. Verifique os logs do console (F12)
2. Teste em janela privada
3. Reinicie o navegador
4. Atualize as extensões