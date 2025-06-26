import { createClient, RedisClientType } from 'redis';
import { config } from '../config/env';

export class RedisCache {
  private static instance: RedisCache;
  private client: RedisClientType;
  private connected = false;

  constructor() {
    this.client = createClient({
      url: config.REDIS_URL,
      socket: {
        connectTimeout: 10000
      }
    });

    this.setupEventHandlers();
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  private setupEventHandlers() {
    this.client.on('error', (err) => {
      console.error('❌ Redis Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('🔗 Redis conectado');
      this.connected = true;
    });

    this.client.on('ready', () => {
      console.log('✅ Redis pronto para uso');
      this.connected = true;
    });

    this.client.on('end', () => {
      console.log('🔌 Redis desconectado');
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      try {
        await this.client.connect();
        this.connected = true;
      } catch (error) {
        console.error('❌ Erro conectando ao Redis:', error);
        this.connected = false;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  // Cache para descoberta de pools (operação mais pesada)
  async cachePoolDiscovery(query: string, pools: any[], ttlMinutes = 30): Promise<void> {
    if (!this.connected) return;

    try {
      const key = `pools:discovery:${this.hashQuery(query)}`;
      const value = JSON.stringify({
        data: pools,
        timestamp: Date.now(),
        count: pools.length
      });

      await this.client.setEx(key, ttlMinutes * 60, value);
      console.log(`💾 Cache SET pools discovery: ${pools.length} pools, TTL: ${ttlMinutes}min`);
    } catch (error) {
      console.warn('⚠️ Erro ao cachear pools:', error);
    }
  }

  async getCachedPoolDiscovery(query: string): Promise<any[] | null> {
    if (!this.connected) return null;

    try {
      const key = `pools:discovery:${this.hashQuery(query)}`;
      const cached = await this.client.get(key);

      if (cached) {
        const data = JSON.parse(cached);
        console.log(`💾 Cache HIT pools discovery: ${data.count} pools`);
        return data.data;
      }

      console.log(`💾 Cache MISS pools discovery: ${key}`);
      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache pools:', error);
      return null;
    }
  }

  // Cache para rankings de pools (recalculado a cada 15min)
  async cachePoolRankings(rankings: any[], ttlMinutes = 15): Promise<void> {
    if (!this.connected) return;

    try {
      const key = 'pools:rankings:latest';
      const value = JSON.stringify({
        data: rankings,
        timestamp: Date.now(),
        count: rankings.length
      });

      await this.client.setEx(key, ttlMinutes * 60, value);
      console.log(`💾 Cache SET pool rankings: ${rankings.length} rankings, TTL: ${ttlMinutes}min`);
    } catch (error) {
      console.warn('⚠️ Erro ao cachear rankings:', error);
    }
  }

  async getCachedPoolRankings(): Promise<any[] | null> {
    if (!this.connected) return null;

    try {
      const key = 'pools:rankings:latest';
      const cached = await this.client.get(key);

      if (cached) {
        const data = JSON.parse(cached);
        console.log(`💾 Cache HIT pool rankings: ${data.count} rankings`);
        return data.data;
      }

      console.log('💾 Cache MISS pool rankings');
      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache rankings:', error);
      return null;
    }
  }

  // Cache para dados de carteira (TTL curto devido a mudanças frequentes)
  async cacheWalletData(publicKey: string, dataType: string, data: any, ttlMinutes = 10): Promise<void> {
    if (!this.connected) return;

    try {
      const key = `wallet:${publicKey}:${dataType}`;
      const value = JSON.stringify({
        data,
        timestamp: Date.now()
      });

      await this.client.setEx(key, ttlMinutes * 60, value);
      console.log(`💾 Cache SET wallet ${dataType}: ${publicKey.slice(0, 8)}..., TTL: ${ttlMinutes}min`);
    } catch (error) {
      console.warn('⚠️ Erro ao cachear wallet:', error);
    }
  }

  async getCachedWalletData(publicKey: string, dataType: string): Promise<any | null> {
    if (!this.connected) return null;

    try {
      const key = `wallet:${publicKey}:${dataType}`;
      const cached = await this.client.get(key);

      if (cached) {
        const data = JSON.parse(cached);
        console.log(`💾 Cache HIT wallet ${dataType}: ${publicKey.slice(0, 8)}...`);
        return data.data;
      }

      console.log(`💾 Cache MISS wallet ${dataType}: ${publicKey.slice(0, 8)}...`);
      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache wallet:', error);
      return null;
    }
  }

  // Cache para preços de tokens (atualizado a cada 5min)
  async cacheTokenPrices(prices: Record<string, number>, ttlMinutes = 5): Promise<void> {
    if (!this.connected) return;

    try {
      const key = 'tokens:prices:latest';
      const value = JSON.stringify({
        data: prices,
        timestamp: Date.now()
      });

      await this.client.setEx(key, ttlMinutes * 60, value);
      console.log(`💾 Cache SET token prices: ${Object.keys(prices).length} tokens, TTL: ${ttlMinutes}min`);
    } catch (error) {
      console.warn('⚠️ Erro ao cachear preços:', error);
    }
  }

  async getCachedTokenPrices(): Promise<Record<string, number> | null> {
    if (!this.connected) return null;

    try {
      const key = 'tokens:prices:latest';
      const cached = await this.client.get(key);

      if (cached) {
        const data = JSON.parse(cached);
        console.log(`💾 Cache HIT token prices: ${Object.keys(data.data).length} tokens`);
        return data.data;
      }

      console.log('💾 Cache MISS token prices');
      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache preços:', error);
      return null;
    }
  }

  // Cache para análises de oportunidades (recalculado a cada 20min)
  async cacheOpportunities(opportunities: any[], ttlMinutes = 20): Promise<void> {
    if (!this.connected) return;

    try {
      const key = 'analytics:opportunities:latest';
      const value = JSON.stringify({
        data: opportunities,
        timestamp: Date.now(),
        count: opportunities.length
      });

      await this.client.setEx(key, ttlMinutes * 60, value);
      console.log(`💾 Cache SET opportunities: ${opportunities.length} oportunidades, TTL: ${ttlMinutes}min`);
    } catch (error) {
      console.warn('⚠️ Erro ao cachear oportunidades:', error);
    }
  }

  async getCachedOpportunities(): Promise<any[] | null> {
    if (!this.connected) return null;

    try {
      const key = 'analytics:opportunities:latest';
      const cached = await this.client.get(key);

      if (cached) {
        const data = JSON.parse(cached);
        console.log(`💾 Cache HIT opportunities: ${data.count} oportunidades`);
        return data.data;
      }

      console.log('💾 Cache MISS opportunities');
      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar cache opportunities:', error);
      return null;
    }
  }

  // Utilidades
  private hashQuery(query: string): string {
    // Hash simples para criar chaves únicas de cache
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Invalidar cache específico
  async invalidateCache(pattern: string): Promise<void> {
    if (!this.connected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`🗑️ Cache invalidado: ${keys.length} chaves removidas`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao invalidar cache:', error);
    }
  }

  // Limpar todo o cache
  async flushAll(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.flushAll();
      console.log('🗑️ Todo o cache Redis foi limpo');
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error);
    }
  }

  // Estatísticas do cache
  async getCacheStats(): Promise<any> {
    if (!this.connected) return null;

    try {
      const info = await this.client.info('memory');
      const dbSize = await this.client.dbSize();
      
      return {
        connected: this.connected,
        dbSize,
        memoryInfo: info,
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn('⚠️ Erro ao obter stats do cache:', error);
      return null;
    }
  }
}

// Singleton instance
export const redisCache = RedisCache.getInstance();