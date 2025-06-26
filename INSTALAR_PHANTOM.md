# 🔧 Como Instalar o Phantom Wallet

## 📥 **INSTALAÇÃO RÁPIDA**

### **Opção 1: Chrome/Chromium**
1. Abra: https://phantom.app/download
2. Clique em "Add to Chrome"
3. Confirme "Adicionar extensão"
4. ✅ Phantom instalado!

### **Opção 2: Firefox**
1. Abra: https://addons.mozilla.org/pt-BR/firefox/addon/phantom-app/
2. Clique em "Adicionar ao Firefox"
3. Confirme "Adicionar"
4. ✅ Phantom instalado!

### **Opção 3: Edge**
1. Abra: https://microsoftedge.microsoft.com/addons/detail/phantom/fhbohimaelbohpjbbldcngcnapndodjp
2. Clique em "Obter"
3. Confirme instalação
4. ✅ Phantom instalado!

## 🔧 **APÓS INSTALAÇÃO**

### **1. Configurar Carteira**
- Clique no ícone do Phantom (👻) na barra de extensões
- Escolha "Criar nova carteira" ou "Importar carteira"
- **IMPORTANTE**: Guarde sua frase secreta em local seguro!

### **2. Testar Instalação**
```bash
# Abrir teste no navegador com Phantom
firefox debug-phantom-completo.html
```

### **3. Verificar se Funcionou**
- Abra o Console do navegador (F12)
- Digite: `window.solana?.isPhantom`
- Deve retornar: `true`

## 🚨 **PROBLEMAS COMUNS**

### **Phantom não aparece**
- Verifique se a extensão está habilitada
- Recarregue a página (Ctrl+F5)
- Reinicie o navegador

### **Erro de conexão**
- Desbloqueie o Phantom (clique no ícone)
- Permita popups no navegador
- Teste em modo incógnito

### **Não consegue assinar**
- Verifique se tem SOL na carteira
- Desabilite popup blocker
- Atualize a extensão Phantom

## 🔗 **LINKS ÚTEIS**
- **Site oficial**: https://phantom.app
- **Suporte**: https://help.phantom.app
- **Documentação**: https://docs.phantom.app

---

## ✅ **TESTE RÁPIDO**
Após instalar, execute:
```bash
node test-phantom-cli.js
```

Deve mostrar: `✅ Backend OK` para confirmar que o sistema está funcionando. 