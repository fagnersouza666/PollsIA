# 🚀 PollsIA - Guia de Produção

## 📋 Visão Geral

Este guia contém todas as instruções necessárias para configurar e executar o PollsIA em ambiente de produção.

## 🔧 Pré-requisitos

### Servidor
- Ubuntu 20.04+ ou CentOS 8+
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM mínimo (8GB recomendado)
- 50GB de espaço em disco
- Conexão com internet estável

### Domínio e SSL
- Domínio registrado
- Certificado SSL (recomendado: Let's Encrypt)
- DNS configurado para o servidor

## 🏗️ Configuração Inicial

### 1. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Criar usuário para a aplicação
sudo useradd -m -s /bin/bash pollsia
sudo usermod -aG docker pollsia
```

### 2. Configuração do Projeto

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/PollsIA.git /opt/pollsia
cd /opt/pollsia

# Configurar permissões
sudo chown -R pollsia:pollsia /opt/pollsia
sudo chmod +x scripts/*.sh

# Copiar arquivo de ambiente
cp .env.production.example .env.production
```

### 3. Configuração de Ambiente

Edite o arquivo `.env.production` com suas configurações:

```bash
# Aplicação
FRONTEND_URL=https://pollsia.com
NODE_ENV=production

# Base de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/pollsia
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Redis
REDIS_URL=redis://redis:6379

# Segurança
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_CLUSTER=mainnet-beta

# Frontend
NEXT_PUBLIC_API_URL=https://pollsia.com/api
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

## 🚀 Deployment

### Deploy Automático

```bash
# Executar script de deploy
sudo ./scripts/deploy.sh
```

### Deploy Manual

```bash
# 1. Criar backup
./scripts/backup.sh

# 2. Executar migrações
./scripts/migrate.sh

# 3. Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar saúde
curl -f http://localhost/health
```

## 🔒 Configuração SSL

### Usando Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot

# Gerar certificado
sudo certbot certonly --standalone -d pollsia.com -d www.pollsia.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/pollsia.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/pollsia.com/privkey.pem ./ssl/

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento

### Health Checks

```bash
# Backend
curl -f http://localhost/health

# Frontend
curl -f http://localhost/api/health

# Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### Logs

```bash
# Ver logs de todos os serviços
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## 🔧 Manutenção

### Backup

```bash
# Backup manual
./scripts/backup.sh

# Configurar backup automático (crontab)
0 2 * * * /opt/pollsia/scripts/backup.sh
```

### Atualizações

```bash
# Atualizar código
git pull origin main

# Rebuild e redeploy
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Limpar imagens antigas
docker image prune -f
```

### Scaling

```bash
# Escalar backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Escalar frontend
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

## 🛡️ Segurança

### Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Hardening

```bash
# Desabilitar login root
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Configurar fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📈 Performance

### Otimizações

```bash
# Configurar limits do sistema
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Otimizar kernel
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
sysctl -p
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Serviço não inicia**
   ```bash
   docker-compose -f docker-compose.prod.yml logs service-name
   ```

2. **Erro de conexão com banco**
   ```bash
   # Verificar variáveis de ambiente
   docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
   ```

3. **Erro de SSL**
   ```bash
   # Verificar certificados
   sudo certbot certificates
   ```

4. **High CPU/Memory**
   ```bash
   # Monitorar recursos
   docker stats
   ```

### Comandos Úteis

```bash
# Status dos serviços
docker-compose -f docker-compose.prod.yml ps

# Reiniciar serviço específico
docker-compose -f docker-compose.prod.yml restart backend

# Acessar container
docker-compose -f docker-compose.prod.yml exec backend bash

# Ver métricas
docker-compose -f docker-compose.prod.yml top
```

## 📞 Suporte

Para suporte técnico:
- 📧 Email: suporte@pollsia.com
- 📱 Slack: #pollsia-support
- 📖 Documentação: https://docs.pollsia.com

---

## ✅ Checklist de Produção

- [ ] Servidor configurado com requisitos mínimos
- [ ] Docker e Docker Compose instalados
- [ ] Domínio e SSL configurados
- [ ] Variáveis de ambiente configuradas
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Firewall configurado
- [ ] Health checks funcionando
- [ ] Logs centralizados
- [ ] Processo de deploy testado

🎉 **Sistema pronto para produção!**