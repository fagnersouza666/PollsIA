import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface PoolConfig {
  baseURL: string;
  timeout: number;
  maxConcurrent: number;
  retryAttempts: number;
  retryDelay: number;
}

interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
}

export class ConnectionPool {
  private pools: Map<string, AxiosInstance> = new Map();
  private queues: Map<string, QueuedRequest[]> = new Map();
  private activeRequests: Map<string, number> = new Map();
  private configs: Map<string, PoolConfig> = new Map();

  constructor() {
    // Configurações otimizadas para cada API
    this.setupPool('raydium', {
      baseURL: 'https://api.raydium.io/v2',
      timeout: 15000,
      maxConcurrent: 3,
      retryAttempts: 3,
      retryDelay: 1000
    });

    this.setupPool('helius', {
      baseURL: 'https://mainnet.helius-rpc.com',
      timeout: 10000,
      maxConcurrent: 2,
      retryAttempts: 2,
      retryDelay: 2000
    });

    this.setupPool('birdeye', {
      baseURL: 'https://public-api.birdeye.so',
      timeout: 8000,
      maxConcurrent: 2,
      retryAttempts: 2,
      retryDelay: 1500
    });

    this.setupPool('jupiter', {
      baseURL: 'https://quote-api.jup.ag/v6',
      timeout: 5000,
      maxConcurrent: 4,
      retryAttempts: 3,
      retryDelay: 500
    });

    this.setupPool('coingecko', {
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 5000,
      maxConcurrent: 3,
      retryAttempts: 2,
      retryDelay: 1000
    });

    this.setupPool('solscan', {
      baseURL: 'https://pro-api.solscan.io/v1.0',
      timeout: 10000,
      maxConcurrent: 1,
      retryAttempts: 1,
      retryDelay: 5000
    });

    this.setupPool('dexscreener', {
      baseURL: 'https://api.dexscreener.com/latest',
      timeout: 5000,
      maxConcurrent: 3,
      retryAttempts: 2,
      retryDelay: 1000
    });
  }

  private setupPool(name: string, config: PoolConfig) {
    this.configs.set(name, config);
    this.queues.set(name, []);
    this.activeRequests.set(name, 0);

    const axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PollsIA/1.0'
      }
    });

    // Verificar se interceptors existe antes de usar
    if (axiosInstance.interceptors) {
      // Interceptor para logs e métricas
      axiosInstance.interceptors.request.use(
        (req) => {
          console.log(`🌐 ${name.toUpperCase()}: ${req.method?.toUpperCase()} ${req.url}`);
          return req;
        },
        (error) => Promise.reject(error)
      );

      axiosInstance.interceptors.response.use(
        (response) => {
          console.log(`✅ ${name.toUpperCase()}: ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          const status = error.response?.status || 'TIMEOUT';
          console.log(`❌ ${name.toUpperCase()}: ${status} ${error.config?.url}`);
          return Promise.reject(error);
        }
      );
    }

    this.pools.set(name, axiosInstance);
  }

  async request(poolName: string, config: AxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        config,
        resolve,
        reject,
        retries: 0
      };

      const queue = this.queues.get(poolName);
      if (!queue) {
        reject(new Error(`Pool ${poolName} não encontrado`));
        return;
      }

      queue.push(queuedRequest);
      this.processQueue(poolName);
    });
  }

  private async processQueue(poolName: string) {
    const queue = this.queues.get(poolName);
    const poolConfig = this.configs.get(poolName);
    const activeCount = this.activeRequests.get(poolName) || 0;

    if (!queue || !poolConfig || activeCount >= poolConfig.maxConcurrent) {
      return;
    }

    const request = queue.shift();
    if (!request) return;

    this.activeRequests.set(poolName, activeCount + 1);

    try {
      const pool = this.pools.get(poolName);
      if (!pool) throw new Error(`Pool ${poolName} não inicializado`);

      const response = await pool.request(request.config);
      request.resolve(response.data);
    } catch (error: any) {
      const shouldRetry = request.retries < poolConfig.retryAttempts &&
        (error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          (error.response?.status >= 500));

      if (shouldRetry) {
        request.retries++;
        console.log(`🔄 ${poolName.toUpperCase()}: Retry ${request.retries}/${poolConfig.retryAttempts}`);

        setTimeout(() => {
          queue.unshift(request);
          this.processQueue(poolName);
        }, poolConfig.retryDelay * request.retries);
      } else {
        request.reject(error);
      }
    } finally {
      this.activeRequests.set(poolName, (this.activeRequests.get(poolName) || 1) - 1);
      // Processa próximo item na queue
      setTimeout(() => this.processQueue(poolName), 100);
    }
  }

  // Métodos de conveniência para cada API
  async raydium(endpoint: string, params?: any) {
    return this.request('raydium', { url: endpoint, params });
  }

  async helius(endpoint: string, data?: any, apiKey?: string) {
    const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
    return this.request('helius', {
      url: endpoint,
      method: data ? 'POST' : 'GET',
      data,
      headers
    });
  }

  async birdeye(endpoint: string, params?: any, apiKey?: string) {
    const headers = apiKey ? { 'X-API-KEY': apiKey } : {};
    return this.request('birdeye', {
      url: endpoint,
      params,
      headers
    });
  }

  async jupiter(endpoint: string, params?: any) {
    return this.request('jupiter', { url: endpoint, params });
  }

  async coingecko(endpoint: string, params?: any) {
    return this.request('coingecko', { url: endpoint, params });
  }

  async solscan(endpoint: string, params?: any, apiKey?: string) {
    const headers = apiKey ? { 'token': apiKey } : {};
    return this.request('solscan', {
      url: endpoint,
      params,
      headers
    });
  }

  async dexscreener(endpoint: string, params?: any) {
    return this.request('dexscreener', { url: endpoint, params });
  }

  // Métricas e monitoramento
  getPoolStats() {
    const stats: Record<string, any> = {};

    for (const [name, queue] of this.queues) {
      stats[name] = {
        queueSize: queue.length,
        activeRequests: this.activeRequests.get(name) || 0,
        maxConcurrent: this.configs.get(name)?.maxConcurrent || 0
      };
    }

    return stats;
  }

  // Cleanup para testes ou desligamento
  shutdown() {
    console.log('🔌 Shutting down all connection pools...');
    for (const [name, pool] of this.pools) {
      if (pool.defaults.httpAgent) {
        (pool.defaults.httpAgent as any).destroy();
      }
      if (pool.defaults.httpsAgent) {
        (pool.defaults.httpsAgent as any).destroy();
      }
      console.log(`  - Pool ${name} connections terminated.`);
    }
    this.pools.clear();
    this.queues.clear();
    this.activeRequests.clear();
  }

  // Cleanup para testes
  cleanup() {
    for (const queue of this.queues.values()) {
      queue.forEach(req => req.reject(new Error('Pool cleanup')));
      queue.length = 0;
    }
  }
}

// Singleton instance
export const connectionPool = new ConnectionPool();