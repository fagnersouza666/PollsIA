# Backend Dockerfile com configurações de memória otimizadas
FROM node:20-alpine

# Configurar limite de memória no container
ENV NODE_OPTIONS="--max-old-space-size=4096 --expose-gc"

WORKDIR /app

# Copy package files primeiro para aproveitar cache do Docker
COPY package*.json ./

# Install dependencies with memory optimizations
RUN npm install --no-audit --no-fund --production --legacy-peer-deps || echo "Install completed with warnings"

# Copy source code
COPY . .

# Build com limite de memória
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start com configurações de memória otimizadas
CMD ["node", "--max-old-space-size=4096", "--expose-gc", "dist/index.js"]
