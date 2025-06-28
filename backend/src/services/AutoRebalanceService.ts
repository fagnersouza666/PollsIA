/**
 * Auto Rebalance Service - Inspirado no VaraYield-AI
 * 
 * Sistema de rebalanceamento automático baseado em APY e condições de mercado
 * Implementa lógica similar ao "dynamic fund allocation" do VaraYield-AI
 */

import RiskManagementService from './RiskManagementService';

export interface RebalanceCondition {
  id: string;
  name: string;
  description: string;
  checkInterval: number; // em minutos
  condition: (currentState: PortfolioState, marketData: MarketData) => boolean;
  priority: number; // 1-10 (10 = highest)
}

export interface PortfolioState {
  totalValue: number;
  positions: {
    poolId: string;
    amount: number;
    percentage: number;
    currentAPY: number;
    entryAPY: number;
    value: number;
  }[];
  riskProfile: string;
  lastRebalance: Date;
  performance: {
    totalReturn: number;
    timeWeightedReturn: number;
    sharpeRatio: number;
  };
}

export interface MarketData {
  pools: {
    id: string;
    currentAPY: number;
    tvl: number;
    volume24h: number;
    priceImpact: number;
  }[];
  marketVolatility: number;
  totalMarketTVL: number;
}

export interface RebalanceAction {
  type: 'move' | 'add' | 'remove' | 'adjust';
  fromPool?: string;
  toPool: string;
  amount: number;
  percentage: number;
  reason: string;
  expectedImprovement: {
    apyGain: number;
    riskReduction: number;
    confidenceLevel: number;
  };
}

export interface RebalanceStrategy {
  shouldRebalance: boolean;
  actions: RebalanceAction[];
  estimatedCost: number;
  estimatedGain: number;
  netBenefit: number;
  riskImpact: number;
  confidence: number;
  reasoning: string[];
}

export class AutoRebalanceService {
  private riskService: RiskManagementService;
  private rebalanceConditions: Map<string, RebalanceCondition> = new Map();
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.riskService = new RiskManagementService();
    this.initializeRebalanceConditions();
  }

  /**
   * Inicializa condições de rebalanceamento inspiradas no VaraYield-AI
   */
  private initializeRebalanceConditions(): void {
    // Condição 1: APY Opportunity - Detecta oportunidades de yield superior
    this.rebalanceConditions.set('apy_opportunity', {
      id: 'apy_opportunity',
      name: 'APY Opportunity',
      description: 'Detecta pools com APY significativamente superior',
      checkInterval: 15, // Verificar a cada 15 minutos
      priority: 8,
      condition: (portfolio, market) => {
        const bestAPY = Math.max(...market.pools.map(p => p.currentAPY));
        const currentAvgAPY = portfolio.positions.reduce((sum, pos) => 
          sum + (pos.currentAPY * pos.percentage), 0) / 100;
        
        return (bestAPY - currentAvgAPY) > 2.0; // 2% de diferença
      }
    });

    // Condição 2: Risk Threshold - Monitora limite de risco
    this.rebalanceConditions.set('risk_threshold', {
      id: 'risk_threshold',
      name: 'Risk Threshold',
      description: 'Rebalanceia quando risco excede limites do perfil',
      checkInterval: 30,
      priority: 10,
      condition: (portfolio, market) => {
        const riskProfile = this.riskService.getRiskProfile(portfolio.riskProfile);
        if (!riskProfile) return false;
        
        // Calcular risco atual do portfolio
        const currentRisk = this.calculatePortfolioRisk(portfolio, market);
        return currentRisk > riskProfile.maxRisk;
      }
    });

    // Condição 3: Performance Drift - Detecta divergência de performance
    this.rebalanceConditions.set('performance_drift', {
      id: 'performance_drift',
      name: 'Performance Drift',
      description: 'Rebalanceia quando performance diverge do benchmark',
      checkInterval: 60,
      priority: 6,
      condition: (portfolio, market) => {
        const daysSinceLastRebalance = 
          (Date.now() - portfolio.lastRebalance.getTime()) / (1000 * 60 * 60 * 24);
        
        return daysSinceLastRebalance > 7 && portfolio.performance.totalReturn < -5;
      }
    });

    // Condição 4: Market Volatility - Responde a volatilidade extrema
    this.rebalanceConditions.set('market_volatility', {
      id: 'market_volatility',
      name: 'Market Volatility',
      description: 'Ajusta exposição durante alta volatilidade',
      checkInterval: 10,
      priority: 9,
      condition: (portfolio, market) => {
        return market.marketVolatility > 0.3; // 30% de volatilidade
      }
    });

    // Condição 5: Liquidity Crisis - Detecta problemas de liquidez
    this.rebalanceConditions.set('liquidity_crisis', {
      id: 'liquidity_crisis',
      name: 'Liquidity Crisis',
      description: 'Move fundos de pools com baixa liquidez',
      checkInterval: 20,
      priority: 7,
      condition: (portfolio, market) => {
        return portfolio.positions.some(pos => {
          const poolData = market.pools.find(p => p.id === pos.poolId);
          return poolData && poolData.tvl < 500000; // TVL abaixo de 500k
        });
      }
    });
  }

  /**
   * Analisa se rebalanceamento é necessário - Inspirado no VaraYield-AI
   */
  async analyzeRebalanceNeed(
    portfolio: PortfolioState,
    marketData: MarketData
  ): Promise<RebalanceStrategy> {
    console.log('🔍 Analisando necessidade de rebalanceamento...');

    const triggeredConditions: RebalanceCondition[] = [];
    
    // Verificar todas as condições
    for (const condition of this.rebalanceConditions.values()) {
      if (condition.condition(portfolio, marketData)) {
        triggeredConditions.push(condition);
        console.log(`⚠️ Condição ativada: ${condition.name}`);
      }
    }

    if (triggeredConditions.length === 0) {
      return {
        shouldRebalance: false,
        actions: [],
        estimatedCost: 0,
        estimatedGain: 0,
        netBenefit: 0,
        riskImpact: 0,
        confidence: 1.0,
        reasoning: ['Portfolio está bem balanceado, nenhuma ação necessária']
      };
    }

    // Gerar estratégia de rebalanceamento
    const strategy = await this.generateRebalanceStrategy(
      portfolio,
      marketData,
      triggeredConditions
    );

    console.log(`✅ Estratégia gerada: ${strategy.actions.length} ações`);
    return strategy;
  }

  /**
   * Gera estratégia de rebalanceamento otimizada
   */
  private async generateRebalanceStrategy(
    portfolio: PortfolioState,
    marketData: MarketData,
    triggeredConditions: RebalanceCondition[]
  ): Promise<RebalanceStrategy> {
    console.log('🧮 Gerando estratégia de rebalanceamento...');

    const actions: RebalanceAction[] = [];
    const reasoning: string[] = [];

    // Obter nova alocação otimizada
    const mockPools = marketData.pools.map(p => ({
      id: p.id,
      apy: p.currentAPY,
      tvl: p.tvl,
      protocol: 'Raydium CPMM' // Mock protocol
    }));

    const newAllocation = await this.riskService.optimizeAllocation(
      portfolio.riskProfile,
      mockPools,
      portfolio.totalValue
    );

    // Comparar com alocação atual e gerar ações
    for (const newAlloc of newAllocation.allocation) {
      const currentPos = portfolio.positions.find(p => p.poolId === newAlloc.poolId);
      const targetPercentage = newAlloc.percentage;
      
      if (!currentPos) {
        // Nova posição
        const amount = (portfolio.totalValue * targetPercentage) / 100;
        actions.push({
          type: 'add',
          toPool: newAlloc.poolId,
          amount,
          percentage: targetPercentage,
          reason: `Adicionar nova posição: ${newAlloc.reasoning}`,
          expectedImprovement: {
            apyGain: this.calculateAPYGain(newAlloc.poolId, marketData),
            riskReduction: 0,
            confidenceLevel: 0.8
          }
        });
        reasoning.push(`Nova oportunidade identificada em ${newAlloc.poolId}`);
      } else {
        const currentPercentage = currentPos.percentage;
        const percentageDiff = targetPercentage - currentPercentage;
        
        if (Math.abs(percentageDiff) > 5) { // Mudança significativa (>5%)
          const amount = (portfolio.totalValue * Math.abs(percentageDiff)) / 100;
          
          actions.push({
            type: 'adjust',
            toPool: newAlloc.poolId,
            amount,
            percentage: percentageDiff,
            reason: `Ajustar posição: ${newAlloc.reasoning}`,
            expectedImprovement: {
              apyGain: this.calculateAPYGain(newAlloc.poolId, marketData, currentPos.currentAPY),
              riskReduction: percentageDiff < 0 ? 0.1 : -0.05,
              confidenceLevel: 0.85
            }
          });
          
          reasoning.push(
            `Ajustando ${newAlloc.poolId}: ${percentageDiff > 0 ? 'aumentar' : 'reduzir'} ${Math.abs(percentageDiff).toFixed(1)}%`
          );
        }
      }
    }

    // Remover posições não mais recomendadas
    for (const currentPos of portfolio.positions) {
      const stillRecommended = newAllocation.allocation.find(a => a.poolId === currentPos.poolId);
      
      if (!stillRecommended && currentPos.percentage > 5) {
        actions.push({
          type: 'remove',
          fromPool: currentPos.poolId,
          toPool: newAllocation.allocation[0]?.poolId || '',
          amount: currentPos.value,
          percentage: currentPos.percentage,
          reason: 'Pool não mais recomendada pelo algoritmo',
          expectedImprovement: {
            apyGain: 0,
            riskReduction: 0.2,
            confidenceLevel: 0.7
          }
        });
        reasoning.push(`Removendo posição em ${currentPos.poolId} (não mais otimizada)`);
      }
    }

    // Calcular métricas da estratégia
    const estimatedCost = this.calculateTransactionCosts(actions);
    const estimatedGain = this.calculateEstimatedGains(actions, portfolio);
    const netBenefit = estimatedGain - estimatedCost;
    const riskImpact = this.calculateRiskImpact(actions, portfolio);
    const confidence = this.calculateStrategyConfidence(actions, triggeredConditions);

    return {
      shouldRebalance: actions.length > 0 && netBenefit > 0,
      actions,
      estimatedCost,
      estimatedGain,
      netBenefit,
      riskImpact,
      confidence,
      reasoning
    };
  }

  /**
   * Calcula risco atual do portfolio
   */
  private calculatePortfolioRisk(portfolio: PortfolioState, market: MarketData): number {
    let weightedRisk = 0;
    
    for (const position of portfolio.positions) {
      const poolData = market.pools.find(p => p.id === position.poolId);
      if (poolData) {
        // Risco baseado em APY, TVL e volatilidade
        let poolRisk = 0;
        
        // APY risk (APY muito alto = maior risco)
        if (poolData.currentAPY > 20) poolRisk += 0.3;
        else if (poolData.currentAPY > 10) poolRisk += 0.1;
        
        // TVL risk (TVL baixo = maior risco)
        if (poolData.tvl < 1000000) poolRisk += 0.4;
        else if (poolData.tvl < 5000000) poolRisk += 0.2;
        
        // Price impact risk
        poolRisk += Math.min(poolData.priceImpact * 2, 0.3);
        
        weightedRisk += poolRisk * (position.percentage / 100);
      }
    }
    
    return Math.min(weightedRisk, 1);
  }

  /**
   * Calcula ganho de APY esperado
   */
  private calculateAPYGain(poolId: string, market: MarketData, currentAPY?: number): number {
    const poolData = market.pools.find(p => p.id === poolId);
    if (!poolData) return 0;
    
    return currentAPY ? poolData.currentAPY - currentAPY : poolData.currentAPY;
  }

  /**
   * Calcula custos de transação estimados
   */
  private calculateTransactionCosts(actions: RebalanceAction[]): number {
    return actions.length * 0.003; // ~0.3% por transação (fees + slippage)
  }

  /**
   * Calcula ganhos estimados
   */
  private calculateEstimatedGains(actions: RebalanceAction[], portfolio: PortfolioState): number {
    return actions.reduce((total, action) => {
      const annualizedGain = action.expectedImprovement.apyGain * (action.amount / portfolio.totalValue);
      return total + (annualizedGain / 365) * 30; // Ganho estimado em 30 dias
    }, 0);
  }

  /**
   * Calcula impacto no risco
   */
  private calculateRiskImpact(actions: RebalanceAction[], portfolio: PortfolioState): number {
    return actions.reduce((total, action) => {
      return total + (action.expectedImprovement.riskReduction * action.percentage / 100);
    }, 0);
  }

  /**
   * Calcula confiança na estratégia
   */
  private calculateStrategyConfidence(
    actions: RebalanceAction[],
    triggeredConditions: RebalanceCondition[]
  ): number {
    const baseConfidence = 0.7;
    const conditionBonus = Math.min(triggeredConditions.length * 0.1, 0.3);
    const actionPenalty = Math.max(actions.length * 0.02, 0.1);
    
    return Math.min(Math.max(baseConfidence + conditionBonus - actionPenalty, 0.3), 1.0);
  }

  /**
   * Executa rebalanceamento automático
   */
  async executeAutoRebalance(
    portfolio: PortfolioState,
    marketData: MarketData,
    autoApprove: boolean = false
  ): Promise<{
    executed: boolean;
    strategy?: RebalanceStrategy;
    transactionHashes?: string[];
    error?: string;
  }> {
    try {
      console.log('🚀 Executando rebalanceamento automático...');
      
      const strategy = await this.analyzeRebalanceNeed(portfolio, marketData);
      
      if (!strategy.shouldRebalance) {
        return { executed: false, strategy };
      }

      if (!autoApprove && strategy.netBenefit < 0.01) {
        console.log('⚠️ Benefício insuficiente, aprovação manual necessária');
        return { executed: false, strategy };
      }

      // Simular execução das transações
      const transactionHashes: string[] = [];
      
      for (const action of strategy.actions) {
        // Em implementação real, executaria as transações aqui
        const mockHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        transactionHashes.push(mockHash);
        
        console.log(`✅ Ação executada: ${action.type} - ${action.toPool} - ${mockHash}`);
      }

      console.log(`🎉 Rebalanceamento concluído: ${strategy.actions.length} ações`);
      
      return {
        executed: true,
        strategy,
        transactionHashes
      };

    } catch (error) {
      console.error('❌ Erro no rebalanceamento automático:', error);
      return {
        executed: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia monitoramento automático
   */
  startAutoMonitoring(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🤖 Iniciando monitoramento automático de rebalanceamento...');
    
    // Verificar a cada 5 minutos
    this.intervalId = setInterval(async () => {
      try {
        // Em implementação real, buscaria dados atuais do portfolio e mercado
        console.log('🔄 Verificação automática de rebalanceamento...');
        
        // Mock implementation - substitua por dados reais
        // const portfolio = await this.getCurrentPortfolio();
        // const marketData = await this.getMarketData();
        // await this.executeAutoRebalance(portfolio, marketData, true);
        
      } catch (error) {
        console.error('❌ Erro na verificação automática:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Para monitoramento automático
   */
  stopAutoMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Monitoramento automático parado');
  }

  /**
   * Status do serviço
   */
  getStatus(): {
    isRunning: boolean;
    conditionsCount: number;
    conditions: string[];
  } {
    return {
      isRunning: this.isRunning,
      conditionsCount: this.rebalanceConditions.size,
      conditions: Array.from(this.rebalanceConditions.values()).map(c => c.name)
    };
  }
}

export default AutoRebalanceService;