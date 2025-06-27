# 🔗 Backend Logs Implementados - Guia de Teste

## 📋 Resumo

Implementei logs customizados no backend (debug-server.js) para exibir as URLs das chamadas de API de forma clara e legível.

## 🎯 Logs Implementados

### ✅ Formato dos Logs
```bash
🔗 HH:MM:SS.sss API Request: [METHOD] /api/endpoint
✅ HH:MM:SS.sss API Success: [METHOD] /api/endpoint - StatusCode
❌ HH:MM:SS.sss API Error: [METHOD] /api/endpoint - StatusCode
```

### 🔧 Modificações no debug-server.js

1. **Desabilitei logger JSON do Fastify**:
```javascript
const fastify = require('fastify')({ 
  logger: false // Logs customizados mais claros
});
```

2. **Adicionei middleware onRequest**:
```javascript
fastify.addHook('onRequest', async (request, reply) => {
  const method = request.method;
  const url = request.url;
  const timestamp = new Date().toISOString().substring(11, 23);
  
  // Filtrar apenas chamadas relevantes (excluir OPTIONS, favicon, etc.)
  if (method !== 'OPTIONS' && !url.includes('favicon') && url.startsWith('/api')) {
    console.log(`🔗 ${timestamp} API Request: [${method}] ${url}`);
  }
});
```

3. **Adicionei middleware onResponse**:
```javascript
fastify.addHook('onResponse', async (request, reply) => {
  const method = request.method;
  const url = request.url;
  const statusCode = reply.statusCode;
  const timestamp = new Date().toISOString().substring(11, 23);
  
  if (method !== 'OPTIONS' && !url.includes('favicon') && url.startsWith('/api')) {
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`✅ ${timestamp} API Success: [${method}] ${url} - ${statusCode}`);
    } else {
      console.log(`❌ ${timestamp} API Error: [${method}] ${url} - ${statusCode}`);
    }
  }
});
```

## 🚀 Como Testar

### 1. **Reiniciar Backend**
```bash
cd /home/fagnersouza/Projetos/claude/PollsIA/backend
npm run dev
```

### 2. **Fazer Chamadas de Teste**
```bash
# Em outro terminal
curl http://localhost:3001/api/pools/discover
curl http://localhost:3001/api/pools/rankings
curl http://localhost:3001/health
```

### 3. **Observar Logs no Terminal do Backend**
Você deveria ver algo como:
```bash
🚀 Debug server running on port 3001
📊 Health check: http://localhost:3001/health
🏊 Test endpoint: http://localhost:3001/api/pools/discover

🔗 18:20:15.123 API Request: [GET] /api/pools/discover
✅ 18:20:15.234 API Success: [GET] /api/pools/discover - 200

🔗 18:20:16.456 API Request: [GET] /api/pools/rankings
✅ 18:20:16.567 API Success: [GET] /api/pools/rankings - 200
```

## 🎨 Testar via Frontend

### 1. **Iniciar Frontend**
```bash
cd /home/fagnersouza/Projetos/claude/PollsIA/frontend
npm run dev
```

### 2. **Abrir Navegador**
- Acesse: `http://localhost:3000`
- Abra o console do navegador (F12)

### 3. **Observar Logs Duplos**
- **Frontend Console**: Logs das chamadas HTTP
- **Backend Terminal**: Logs das requisições recebidas

## 🔍 Exemplo Completo de Logs

### 🎨 Frontend (Console do Navegador)
```bash
🔗 API Call: [GET] http://localhost:3001/api/pools/discover
✅ API Success: [GET] http://localhost:3001/api/pools/discover - 200

🔗 API Call: [GET] http://localhost:3001/api/pools/rankings
✅ API Success: [GET] http://localhost:3001/api/pools/rankings - 200
```

### 🔙 Backend (Terminal)
```bash
🔗 18:20:15.123 API Request: [GET] /api/pools/discover
✅ 18:20:15.234 API Success: [GET] /api/pools/discover - 200

🔗 18:20:16.456 API Request: [GET] /api/pools/rankings
✅ 18:20:16.567 API Success: [GET] /api/pools/rankings - 200
```

## 🧪 Endpoints para Teste

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/pools/discover` | GET | Descobrir pools do Raydium |
| `/api/pools/rankings` | GET | Rankings por score |
| `/api/wallet/{publicKey}/portfolio` | GET | Dados do portfólio |
| `/api/wallet/{publicKey}/positions` | GET | Posições ativas |
| `/api/investment/invest` | POST | Iniciar investimento |
| `/api/investment/process-signed` | POST | Processar transação |
| `/api/analytics/market-overview` | GET | Overview do mercado |

## 🎯 Filtros Implementados

### ✅ Incluídos nos Logs
- Métodos: GET, POST, PUT, DELETE
- URLs que começam com `/api`
- Status codes: todos

### 🚫 Excluídos dos Logs
- Método OPTIONS (CORS preflight)
- URLs com "favicon"
- URLs que não começam com `/api`

## 🔧 Troubleshooting

### ❌ Se não aparece nenhum log:
1. Verificar se o backend está rodando na porta 3001
2. Confirmar que as chamadas estão chegando ao backend
3. Verificar se as URLs começam com `/api`

### ❌ Se apenas aparecem logs JSON:
1. Confirmar que `logger: false` está no fastify
2. Verificar se os hooks foram adicionados corretamente

### ❌ Se logs aparecem duplicados:
- Normal! Frontend e backend logam independentemente
- Frontend: logs das chamadas HTTP
- Backend: logs das requisições recebidas

---

## ✅ Conclusão

Agora o backend também exibe logs claros das URLs chamadas, combinando com os logs do frontend para uma visibilidade completa do fluxo de dados da aplicação!

**Para testar:**
1. `cd backend && npm run dev`
2. Fazer chamadas ou usar o frontend
3. Observar logs limpos no terminal do backend