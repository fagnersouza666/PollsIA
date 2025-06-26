interface Task<T> {
  id: string;
  fn: () => Promise<T>;
  priority: 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
}

interface TaskResult<T> {
  id: string;
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
}

export class ParallelExecutor {
  private concurrencyLimit: number;
  private activeCount = 0;
  private queue: Array<Task<any>> = [];
  private results = new Map<string, TaskResult<any>>();

  constructor(concurrencyLimit = 6) {
    this.concurrencyLimit = concurrencyLimit;
  }

  // Adicionar tarefa à queue
  addTask<T>(task: Task<T>): void {
    this.queue.push(task);
    this.processQueue();
  }

  // Executar múltiplas tarefas em paralelo
  async executeAll<T>(tasks: Task<T>[]): Promise<TaskResult<T>[]> {
    // Ordenar por prioridade
    const sortedTasks = this.sortTasksByPriority(tasks);
    
    const promises = sortedTasks.map(task => this.executeTask(task));
    
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      const task = sortedTasks[index];
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          id: task.id,
          success: false,
          error: result.reason,
          duration: 0
        };
      }
    });
  }

  // Executar tarefas específicas para APIs paralelas
  async executeAPICalls(calls: {
    raydiumPools?: () => Promise<any>;
    tokenPrices?: () => Promise<any>;
    walletBalances?: () => Promise<any>;
    heliusData?: () => Promise<any>;
    birdeyeData?: () => Promise<any>;
    jupiterTokens?: () => Promise<any>;
  }): Promise<{ [key: string]: any }> {
    const tasks: Task<any>[] = [];

    if (calls.raydiumPools) {
      tasks.push({
        id: 'raydiumPools',
        fn: calls.raydiumPools,
        priority: 'high',
        timeout: 30000,
        retries: 2
      });
    }

    if (calls.tokenPrices) {
      tasks.push({
        id: 'tokenPrices',
        fn: calls.tokenPrices,
        priority: 'high',
        timeout: 10000,
        retries: 3
      });
    }

    if (calls.walletBalances) {
      tasks.push({
        id: 'walletBalances',
        fn: calls.walletBalances,
        priority: 'medium',
        timeout: 15000,
        retries: 2
      });
    }

    if (calls.heliusData) {
      tasks.push({
        id: 'heliusData',
        fn: calls.heliusData,
        priority: 'medium',
        timeout: 12000,
        retries: 1
      });
    }

    if (calls.birdeyeData) {
      tasks.push({
        id: 'birdeyeData',
        fn: calls.birdeyeData,
        priority: 'medium',
        timeout: 10000,
        retries: 1
      });
    }

    if (calls.jupiterTokens) {
      tasks.push({
        id: 'jupiterTokens',
        fn: calls.jupiterTokens,
        priority: 'low',
        timeout: 8000,
        retries: 2
      });
    }

    console.log(`🔄 Executando ${tasks.length} APIs calls em paralelo...`);
    const startTime = Date.now();

    const results = await this.executeAll(tasks);
    
    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    
    console.log(`✅ Paralelo concluído: ${successful}/${results.length} APIs successful em ${duration}ms`);

    // Converter para objeto com dados
    const data: { [key: string]: any } = {};
    
    results.forEach(result => {
      if (result.success) {
        data[result.id] = result.data;
      } else {
        console.warn(`⚠️ API ${result.id} falhou:`, result.error?.message);
        data[result.id] = null;
      }
    });

    return data;
  }

  // Executar tarefas de análise de wallet em paralelo
  async executeWalletAnalysis(publicKey: string, calls: {
    portfolio?: () => Promise<any>;
    positions?: () => Promise<any>;
    performance?: () => Promise<any>;
    transactions?: () => Promise<any>;
    lpPositions?: () => Promise<any>;
  }): Promise<{ [key: string]: any }> {
    const tasks: Task<any>[] = [];

    if (calls.portfolio) {
      tasks.push({
        id: 'portfolio',
        fn: calls.portfolio,
        priority: 'high',
        timeout: 15000,
        retries: 2
      });
    }

    if (calls.positions) {
      tasks.push({
        id: 'positions',
        fn: calls.positions,
        priority: 'high',
        timeout: 20000,
        retries: 1
      });
    }

    if (calls.performance) {
      tasks.push({
        id: 'performance',
        fn: calls.performance,
        priority: 'medium',
        timeout: 12000,
        retries: 2
      });
    }

    if (calls.transactions) {
      tasks.push({
        id: 'transactions',
        fn: calls.transactions,
        priority: 'low',
        timeout: 25000,
        retries: 1
      });
    }

    if (calls.lpPositions) {
      tasks.push({
        id: 'lpPositions',
        fn: calls.lpPositions,
        priority: 'high',
        timeout: 18000,
        retries: 1
      });
    }

    console.log(`👤 Analisando wallet ${publicKey.slice(0, 8)}... com ${tasks.length} operações paralelas`);
    const startTime = Date.now();

    const results = await this.executeAll(tasks);
    
    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    
    console.log(`✅ Análise wallet concluída: ${successful}/${results.length} operações em ${duration}ms`);

    // Converter para objeto com dados
    const data: { [key: string]: any } = {};
    
    results.forEach(result => {
      if (result.success) {
        data[result.id] = result.data;
      } else {
        console.warn(`⚠️ Operação ${result.id} falhou:`, result.error?.message);
        data[result.id] = null;
      }
    });

    return data;
  }

  private async executeTask<T>(task: Task<T>): Promise<TaskResult<T>> {
    const startTime = Date.now();
    
    try {
      // Aplicar timeout se especificado
      const promise = task.timeout 
        ? this.withTimeout(task.fn(), task.timeout)
        : task.fn();
        
      const data = await promise;
      
      return {
        id: task.id,
        success: true,
        data,
        duration: Date.now() - startTime
      };
    } catch (error) {
      // Retry logic
      if (task.retries && task.retries > 0) {
        console.log(`🔄 Retry ${task.id} (${task.retries} tentativas restantes)`);
        
        const retryTask = { ...task, retries: task.retries - 1 };
        
        // Aguardar um pouco antes do retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return this.executeTask(retryTask);
      }
      
      return {
        id: task.id,
        success: false,
        error: error as Error,
        duration: Date.now() - startTime
      };
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  private sortTasksByPriority<T>(tasks: Task<T>[]): Task<T>[] {
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    
    return [...tasks].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private async processQueue(): Promise<void> {
    if (this.activeCount >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;
    
    try {
      const result = await this.executeTask(task);
      this.results.set(task.id, result);
    } finally {
      this.activeCount--;
      this.processQueue(); // Processar próxima tarefa
    }
  }

  // Obter estatísticas de performance
  getStats(): { 
    queueSize: number; 
    activeCount: number; 
    totalExecuted: number;
    successRate: number;
  } {
    const executed = Array.from(this.results.values());
    const successful = executed.filter(r => r.success).length;
    
    return {
      queueSize: this.queue.length,
      activeCount: this.activeCount,
      totalExecuted: executed.length,
      successRate: executed.length > 0 ? (successful / executed.length) * 100 : 0
    };
  }

  // Limpar resultados
  clearResults(): void {
    this.results.clear();
  }
}

// Singleton instance otimizado para diferentes cenários
export const apiExecutor = new ParallelExecutor(6); // Para APIs externas
export const walletExecutor = new ParallelExecutor(4); // Para análise de carteiras  
export const poolExecutor = new ParallelExecutor(3); // Para processamento de pools