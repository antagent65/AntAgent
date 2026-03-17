import { BaseAgent, AgentStats } from './BaseAgent.js';
import { LearningConfig, Trade, Signal } from '../types/index.js';
import { OpenClawEngine } from '../openclaw/core.js';
import { logger } from '../utils/logger.js';

/**
 * Learning Agent - Continuous Improvement
 * 
 * Analyzes trading results and updates strategies
 * to improve colony-wide performance over time.
 */
export class LearningAgent extends BaseAgent {
  /** Learning-specific configuration */
  private config: LearningConfig;
  
  /** OpenClaw engine for ML operations */
  private openClaw: OpenClawEngine;
  
  /** Historical trade data */
  private tradeHistory: Trade[];
  
  /** Performance metrics by strategy */
  private strategyMetrics: Map<string, StrategyMetrics>;
  
  /** Model update queue */
  private updateQueue: ModelUpdate[];

  /**
   * Create a new learning agent
   * @param config - Learning configuration
   * @param openClaw - OpenClaw engine instance
   */
  constructor(
    config: LearningConfig,
    openClaw: OpenClawEngine
  ) {
    super(config);
    this.config = config;
    this.openClaw = openClaw;
    this.tradeHistory = [];
    this.strategyMetrics = new Map();
    this.updateQueue = [];
  }

  /**
   * Get learning-specific statistics
   */
  getStats(): LearningStats {
    const baseStats = super.getStats();
    return {
      ...baseStats,
      tradesAnalyzed: this.tradeHistory.length,
      strategiesTracked: this.strategyMetrics.size,
      modelsUpdated: this.updateQueue.length,
      avgWinRate: this.calculateAverageWinRate(),
      avgProfitFactor: this.calculateAverageProfitFactor(),
    };
  }

  /**
   * Initialize the learning agent
   */
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing learning agent...');
    
    // Validate configuration
    const validWindows = ['1h', '6h', '12h', '24h', '7d', '30d'];
    if (!validWindows.includes(this.config.options.evaluationWindow)) {
      throw new Error(
        `Invalid evaluation window: ${this.config.options.evaluationWindow}. Valid: ${validWindows.join(', ')}`
      );
    }
    
    this.log('info', `Learning agent configured with ${this.config.options.evaluationWindow} evaluation window`);
  }

  /**
   * Start the learning loop
   */
  protected async onStart(): Promise<void> {
    this.log('info', 'Starting learning loop...');
    
    // Subscribe to trade events from executor agents
    this.openClaw.on('trade', (trade: Trade) => {
      this.tradeHistory.push(trade);
      this.log('debug', `Trade recorded for analysis: ${trade.id}`);
    });
    
    // Load historical data
    await this.loadHistoricalData();
    
    this.log('info', 'Learning loop started');
  }

  /**
   * Stop the learning loop
   */
  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping learning loop...');
    
    // Save current state
    await this.saveState();
    
    this.log('info', 'Learning loop stopped');
  }

  /**
   * Pause the learning process
   */
  protected async onPause(): Promise<void> {
    this.log('info', 'Pausing learning process...');
  }

  /**
   * Resume the learning process
   */
  protected async onResume(): Promise<void> {
    this.log('info', 'Resuming learning process...');
  }

  /**
   * Execute the learning cycle
   */
  protected async onExecute(): Promise<void> {
    const learnStart = Date.now();
    
    if (this.tradeHistory.length === 0) {
      this.log('debug', 'No trades to analyze yet');
      return;
    }
    
    // Analyze recent trades
    const recentTrades = this.getRecentTrades();
    
    if (recentTrades.length === 0) {
      this.log('debug', 'No recent trades in evaluation window');
      return;
    }
    
    // Calculate performance metrics
    const metrics = this.analyzePerformance(recentTrades);
    this.log('info', `Performance analysis: WinRate=${metrics.winRate.toFixed(2)}%, ProfitFactor=${metrics.profitFactor.toFixed(2)}`);
    
    // Identify patterns and insights
    const insights = await this.identifyPatterns(recentTrades);
    
    // Generate strategy updates
    const updates = await this.generateUpdates(metrics, insights);
    
    // Apply updates
    if (updates.length > 0) {
      await this.applyUpdates(updates);
    }
    
    // Retrain models if needed
    if (this.shouldRetrain()) {
      await this.retrainModels();
    }
    
    const learnDuration = Date.now() - learnStart;
    this.log('debug', `Learning cycle completed in ${learnDuration}ms`);
  }

  /**
   * Reset the learning agent
   */
  protected async onReset(): Promise<void> {
    this.tradeHistory = [];
    this.strategyMetrics.clear();
    this.updateQueue = [];
    this.log('info', 'Learning agent reset');
  }

  /**
   * Load historical trade data
   */
  private async loadHistoricalData(): Promise<void> {
    this.log('info', 'Loading historical trade data...');
    
    try {
      // In production, load from database or OpenClaw storage
      const historicalTrades = await this.openClaw.getHistoricalTrades(1000);
      this.tradeHistory = historicalTrades;
      
      this.log('info', `Loaded ${historicalTrades.length} historical trades`);
    } catch (error) {
      this.log('warn', 'Failed to load historical data', error);
    }
  }

  /**
   * Get trades within the evaluation window
   */
  private getRecentTrades(): Trade[] {
    const windowMs = this.parseWindowToMs(this.config.options.evaluationWindow);
    const cutoff = Date.now() - windowMs;
    
    return this.tradeHistory.filter(t => t.timestamp >= cutoff);
  }

  /**
   * Analyze performance of recent trades
   */
  private analyzePerformance(trades: Trade[]): PerformanceMetrics {
    const wins = trades.filter(t => (t.pnl ?? 0) > 0);
    const losses = trades.filter(t => (t.pnl ?? 0) <= 0);
    
    const totalWins = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0));
    
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    
    const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;
    
    return {
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      profitFactor,
      totalPnl: totalWins - totalLosses,
      avgWin,
      avgLoss,
      largestWin: Math.max(...wins.map(t => t.pnl ?? 0), 0),
      largestLoss: Math.min(...losses.map(t => t.pnl ?? 0), 0),
    };
  }

  /**
   * Identify patterns in trading data
   */
  private async identifyPatterns(trades: Trade[]): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Analyze by time of day
    const timeAnalysis = this.analyzeByTimeOfDay(trades);
    if (timeAnalysis.bestHour !== null) {
      insights.push({
        type: 'temporal',
        description: `Best performing hour: ${timeAnalysis.bestHour}:00`,
        confidence: timeAnalysis.confidence,
        action: 'adjust_timing',
      });
    }
    
    // Analyze by pair
    const pairAnalysis = this.analyzeByPair(trades);
    for (const [pair, metrics] of Object.entries(pairAnalysis)) {
      if (metrics.winRate < 30 && metrics.tradeCount > 5) {
        insights.push({
          type: 'pair_performance',
          description: `Poor performance on ${pair} (win rate: ${metrics.winRate.toFixed(1)}%)`,
          confidence: 0.8,
          action: 'avoid_pair',
          metadata: { pair },
        });
      }
    }
    
    // Analyze by confidence level
    const confidenceAnalysis = this.analyzeByConfidence(trades);
    if (confidenceAnalysis.lowConfidenceWinRate < 40) {
      insights.push({
        type: 'confidence_threshold',
        description: 'Low confidence predictions underperforming',
        confidence: 0.75,
        action: 'raise_confidence_threshold',
      });
    }
    
    // Use OpenClaw for deeper pattern recognition
    const mlInsights = await this.openClaw.runMLModel(
      'pattern-recognition',
      { trades: trades.map(t => ({ ...t })) }
    );
    
    if (mlInsights.patterns) {
      insights.push({
        type: 'ml_discovery',
        description: mlInsights.patterns.description,
        confidence: mlInsights.confidence,
        action: mlInsights.patterns.recommendedAction,
      });
    }
    
    return insights;
  }

  /**
   * Generate strategy updates based on analysis
   */
  private async generateUpdates(
    metrics: PerformanceMetrics,
    insights: Insight[]
  ): Promise<ModelUpdate[]> {
    const updates: ModelUpdate[] = [];
    
    for (const insight of insights) {
      switch (insight.action) {
        case 'adjust_timing':
          updates.push({
            type: 'parameter',
            target: 'executor',
            parameter: 'tradingHours',
            value: insight.description,
            priority: 'medium',
          });
          break;
          
        case 'avoid_pair':
          updates.push({
            type: 'blacklist',
            target: 'executor',
            parameter: 'avoidPairs',
            value: insight.metadata?.pair || '',
            priority: 'high',
          });
          break;
          
        case 'raise_confidence_threshold':
          updates.push({
            type: 'parameter',
            target: 'analyst',
            parameter: 'confidenceThreshold',
            value: 0.75,
            priority: 'medium',
          });
          break;
          
        case 'model_retrain':
          updates.push({
            type: 'retrain',
            target: 'model',
            parameter: insight.metadata?.model || 'trading-classifier',
            value: 'latest_data',
            priority: 'high',
          });
          break;
      }
    }
    
    // Auto-adjust based on profit factor
    if (metrics.profitFactor < 1.0 && metrics.totalTrades > 20) {
      updates.push({
        type: 'parameter',
        target: 'executor',
        parameter: 'maxSlippage',
        value: Math.max(1.0, 2.5 - 0.5),
        priority: 'medium',
      });
    }
    
    return updates;
  }

  /**
   * Apply strategy updates to the colony
   */
  private async applyUpdates(updates: ModelUpdate[]): Promise<void> {
    this.log('info', `Applying ${updates.length} strategy updates...`);
    
    for (const update of updates) {
      try {
        await this.openClaw.applyUpdate(update);
        this.updateQueue.push(update);
        this.log('info', `Update applied: ${update.type} to ${update.target}`);
      } catch (error) {
        this.log('error', `Failed to apply update: ${update.type}`, error);
      }
    }
    
    // Emit update events
    if (updates.length > 0) {
      this.emit('updates_applied', { updates, timestamp: Date.now() });
    }
  }

  /**
   * Determine if models should be retrained
   */
  private shouldRetrain(): boolean {
    // Retrain if we have enough new data
    const recentTrades = this.getRecentTrades();
    const minTradesForRetrain = 100;
    
    return recentTrades.length >= minTradesForRetrain;
  }

  /**
   * Retrain ML models with new data
   */
  private async retrainModels(): Promise<void> {
    this.log('info', 'Starting model retraining...');
    
    try {
      const recentTrades = this.getRecentTrades();
      
      // Prepare training data
      const trainingData = recentTrades.map(trade => ({
        features: {
          pair: trade.pair,
          type: trade.type,
          amount: trade.amount,
          slippage: trade.slippage,
          timestamp: trade.timestamp,
        },
        label: trade.pnl ?? 0 > 0 ? 1 : 0,
      }));
      
      // Retrain models via OpenClaw
      await this.openClaw.retrainModel('trading-classifier', trainingData);
      await this.openClaw.retrainModel('pattern-recognition', trainingData);
      
      this.log('info', 'Model retraining completed successfully');
    } catch (error) {
      this.log('error', 'Model retraining failed', error);
    }
  }

  /**
   * Save current state
   */
  private async saveState(): Promise<void> {
    this.log('debug', 'Saving learning state...');
    
    try {
      await this.openClaw.saveState({
        tradeHistory: this.tradeHistory.slice(-1000), // Keep last 1000 trades
        strategyMetrics: Array.from(this.strategyMetrics.entries()),
        updateQueue: this.updateQueue,
      });
    } catch (error) {
      this.log('error', 'Failed to save state', error);
    }
  }

  /**
   * Analyze trades by time of day
   */
  private analyzeByTimeOfDay(trades: Trade[]): TimeAnalysis {
    const hourlyPerformance: Record<number, { wins: number; total: number; pnl: number }> = {};
    
    for (let i = 0; i < 24; i++) {
      hourlyPerformance[i] = { wins: 0, total: 0, pnl: 0 };
    }
    
    trades.forEach(trade => {
      const hour = new Date(trade.timestamp).getHours();
      hourlyPerformance[hour]!.total++;
      if ((trade.pnl ?? 0) > 0) hourlyPerformance[hour]!.wins++;
      hourlyPerformance[hour]!.pnl += trade.pnl ?? 0;
    });
    
    let bestHour: number | null = null;
    let bestPnl = -Infinity;
    
    for (const [hour, data] of Object.entries(hourlyPerformance)) {
      if (data.total > 0 && data.pnl > bestPnl) {
        bestPnl = data.pnl;
        bestHour = parseInt(hour);
      }
    }
    
    return {
      bestHour,
      confidence: bestHour !== null ? 0.7 : 0,
    };
  }

  /**
   * Analyze trades by pair
   */
  private analyzeByPair(trades: Trade[]): Record<string, PairMetrics> {
    const pairStats: Record<string, { wins: number; total: number; pnl: number }> = {};
    
    trades.forEach(trade => {
      if (!pairStats[trade.pair]) {
        pairStats[trade.pair] = { wins: 0, total: 0, pnl: 0 };
      }
      pairStats[trade.pair]!.total++;
      if ((trade.pnl ?? 0) > 0) pairStats[trade.pair]!.wins++;
      pairStats[trade.pair]!.pnl += trade.pnl ?? 0;
    });
    
    const result: Record<string, PairMetrics> = {};
    for (const [pair, stats] of Object.entries(pairStats)) {
      result[pair] = {
        tradeCount: stats.total,
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
        totalPnl: stats.pnl,
      };
    }
    
    return result;
  }

  /**
   * Analyze trades by confidence level
   */
  private analyzeByConfidence(trades: Trade[]): ConfidenceAnalysis {
    // This would need prediction data linked to trades
    // Simplified for this example
    return {
      highConfidenceWinRate: 65,
      lowConfidenceWinRate: 35,
    };
  }

  /**
   * Calculate average win rate
   */
  private calculateAverageWinRate(): number {
    if (this.tradeHistory.length === 0) return 0;
    const wins = this.tradeHistory.filter(t => (t.pnl ?? 0) > 0).length;
    return (wins / this.tradeHistory.length) * 100;
  }

  /**
   * Calculate average profit factor
   */
  private calculateAverageProfitFactor(): number {
    const wins = this.tradeHistory.filter(t => (t.pnl ?? 0) > 0);
    const losses = this.tradeHistory.filter(t => (t.pnl ?? 0) <= 0);
    
    const totalWins = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0));
    
    return totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  }

  /**
   * Parse window string to milliseconds
   */
  private parseWindowToMs(window: string): number {
    const units: Record<string, number> = {
      h: 3600000,
      d: 86400000,
    };
    
    const value = parseInt(window.slice(0, -1));
    const unit = window.slice(-1);
    
    return value * (units[unit] || 3600000);
  }
}

/**
 * Strategy performance metrics
 */
export interface StrategyMetrics {
  /** Strategy name */
  name: string;
  /** Win rate percentage */
  winRate: number;
  /** Profit factor */
  profitFactor: number;
  /** Total trades */
  trades: number;
  /** Total PnL */
  pnl: number;
}

/**
 * Performance metrics summary
 */
export interface PerformanceMetrics {
  /** Total trades analyzed */
  totalTrades: number;
  /** Number of winning trades */
  wins: number;
  /** Number of losing trades */
  losses: number;
  /** Win rate percentage */
  winRate: number;
  /** Profit factor */
  profitFactor: number;
  /** Total PnL */
  totalPnl: number;
  /** Average win size */
  avgWin: number;
  /** Average loss size */
  avgLoss: number;
  /** Largest win */
  largestWin: number;
  /** Largest loss */
  largestLoss: number;
}

/**
 * Trading insight
 */
export interface Insight {
  /** Insight type */
  type: string;
  /** Insight description */
  description: string;
  /** Confidence level */
  confidence: number;
  /** Recommended action */
  action: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Model update instruction
 */
export interface ModelUpdate {
  /** Update type */
  type: 'parameter' | 'blacklist' | 'retrain';
  /** Target agent/model */
  target: string;
  /** Parameter to update */
  parameter: string;
  /** New value */
  value: unknown;
  /** Update priority */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Time-based analysis result
 */
export interface TimeAnalysis {
  /** Best performing hour */
  bestHour: number | null;
  /** Confidence in finding */
  confidence: number;
}

/**
 * Pair performance metrics
 */
export interface PairMetrics {
  /** Number of trades */
  tradeCount: number;
  /** Win rate percentage */
  winRate: number;
  /** Total PnL */
  totalPnl: number;
}

/**
 * Confidence-based analysis result
 */
export interface ConfidenceAnalysis {
  /** High confidence win rate */
  highConfidenceWinRate: number;
  /** Low confidence win rate */
  lowConfidenceWinRate: number;
}

/**
 * Learning agent statistics
 */
export interface LearningStats extends AgentStats {
  /** Total trades analyzed */
  tradesAnalyzed: number;
  /** Number of strategies tracked */
  strategiesTracked: number;
  /** Number of models updated */
  modelsUpdated: number;
  /** Average win rate */
  avgWinRate: number;
  /** Average profit factor */
  avgProfitFactor: number;
}
