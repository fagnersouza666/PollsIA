# 🚀 PollsIA - Início Rápido

## ⚡ **3 Comandos para Começar**

```bash
# 1️⃣ Clonar e entrar na pasta
git clone <repo-url>
cd PollsIA

# 2️⃣ Configurar ambiente
cp .env.example .env

# 3️⃣ Iniciar tudo
npm start
```

**✅ Pronto! Acesse: http://localhost:3000**

---

## 🎯 **Comandos Úteis**

| Comando | Descrição |
|---------|-----------|
| `npm start` | 🚀 Iniciar tudo com Docker |
| `npm stop` | ⏹️ Parar todos os serviços |
| `npm run logs` | 📋 Ver logs em tempo real |
| `npm run status` | 📊 Status dos containers |
| `npm run restart` | 🔄 Reiniciar serviços |

---

## 🌐 **URLs Importantes**

- **🎨 Frontend:** http://localhost:3000
- **⚙️ API Backend:** http://localhost:3001
- **📚 Docs API:** http://localhost:3001/documentation
- **🧪 Teste Phantom:** [test-wallet.html](test-wallet.html)

---

## 🔧 **Modo Desenvolvimento Manual**

```bash
# Terminal 1 - Backend
cd backend
npm install --legacy-peer-deps
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## 📋 **Pré-requisitos**

- ✅ **Docker + Docker Compose** (recomendado)
- ✅ **Node.js 20+** (para modo manual)
- ✅ **Phantom Wallet** (extensão do browser)

---

## ❓ **Problemas?**

**🐳 Docker não inicia:**
```bash
docker-compose down --volumes
docker system prune -f
npm start
```

**👛 Phantom não conecta:**
1. Instale: https://phantom.app
2. Desbloqueie a extensão
3. Teste: abra `test-wallet.html`

**📦 npm install falha:**
```bash
npm install --legacy-peer-deps
```

---

## 📚 **Documentação Completa**

- 📖 [README.md](README.md) - Documentação completa
- 🔧 [CLAUDE.md](CLAUDE.md) - Guia para desenvolvimento
- 📊 [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) - Documentação da API

---

**💡 Dica:** Para debug detalhado, use `npm run logs` para ver logs em tempo real!