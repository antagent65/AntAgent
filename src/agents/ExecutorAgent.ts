import { BaseAgent, AgentStats } from './BaseAgent.js';
import { ExecutorConfig, Trade, Prediction } from '../types/index.js';
import { SolanaProvider } from '../solana/provider.js';
import { TradingConfig } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Executor Agent - Trade Execution
 * 
 * Executes trades based on predictions from analyst agents,
 * optimizing for timing, slippage, and routing.
 */
export class ExecutorAgent extends BaseAgent {
  /** Executor-specific configuration */
  private config: ExecutorConfig;
  
  /** Solana provider for transactions */
  private solana: SolanaProvider;
  
  /** Trading configuration */
  private tradingConfig: TradingConfig;
  
  /** Pending predictions to execute */
  private predictionQueue: Prediction[];
  
  /** Executed trades history */
  private trades: Trade[];
  
  /** Current positions */
  private positions: Map<string, Position>;

  /**
   * Create a new executor agent
   * @param config - Executor configuration
   * @param solana - Solana provider instance
   * @param tradingConfig - Trading parameters
   */
  constructor(
    config: ExecutorConfig,
    solana: SolanaProvider,
    tradingConfig: TradingConfig
  ) {
    super(config);
    this.config = config;
    this.solana = solana;
    this.tradingConfig = tradingConfig;
    this.predictionQueue = [];
    this.trades = [];
    this.positions = new Map();
  }

  /**
   * Get executor-specific statistics
   */
  getStats(): ExecutorStats {
    const baseStats = super.getStats();
    const totalPnl = this.calculateTotalPnL();
    const wins = this.trades.filter(t => (t.pnl ?? 0) > 0).length;
    const losses = this.trades.filter(t => (t.pnl ?? 0) <= 0).length;
    const totalTradeSize = this.trades.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      ...baseStats,
      pnl: totalPnl,
      wins,
      losses,
      tradeCount: this.trades.length,
      winRate: this.trades.length > 0 ? (wins / this.trades.length) * 100 : 0,
      totalTradeSize,
      activePositions: this.positions.size,
      wallets: this.config.options.wallets,
    };
  }

  /**
   * Initialize the executor agent
   */
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing executor agent...');
    
    // Validate configuration
    if (this.config.options.maxSlippage > this.tradingConfig.maxSlippage) {
      throw new Error(
        `Executor slippage (${this.config.options.maxSlippage}%) exceeds max allowed (${this.tradingConfig.maxSlippage}%)`
      );
    }
    
    if (this.config.options.wallets.length === 0) {
      throw new Error('At least one wallet address is required');
    }
    
    this.log('info', `Executor initialized with ${this.config.options.wallets.length} wallet(s)`);
  }

  /**
   * Start the executor's trading loop
   */
  protected async onStart(): Promise<void> {
    this.log('info', 'Starting executor trading...');
    
    // Set up prediction subscription
    // In production, this would connect to the OpenClaw message bus
    this.log('info', 'Executor trading started');
  }

  /**
   * Stop the executor's trading loop
   */
  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping executor trading...');
    
    // Close all open positions before stopping
    if (this.positions.size > 0) {
      this.log('warn', `Closing ${this.positions.size} open position(s) before stop`);
      await this.closeAllPositions();
    }
    
    this.log('info', 'Executor trading stopped');
  }

  /**
   * Pause the executor's trading
   */
  protected async onPause(): Promise<void> {
    this.log('info', 'Pausing executor trading...');
  }

  /**
   * Resume the executor's trading
   */
  protected async onResume(): Promise<void> {
    this.log('info', 'Resuming executor trading...');
  }

  /**
   * Execute the executor's main trading logic
   */
  protected async onExecute(): Promise<void> {
    const execStart = Date.now();
    
    if (this.predictionQueue.length === 0) {
      this.log('debug', 'No predictions to execute');
      return;
    }
    
    const predictionsToExecute = [...this.predictionQueue];
    this.predictionQueue = [];
    
    for (const prediction of predictionsToExecute) {
      try {
        // Check if we should execute this prediction
        if (!this.shouldExecute(prediction)) {
          this.log('debug', `Skipping prediction: ${prediction.action} ${prediction.pair}`);
          continue;
        }
        
        // Execute the trade
        const trade = await this.executeTrade(prediction);
        this.trades.push(trade);
        
        this.emit('trade', trade);
        this.log('info', `Trade executed: ${trade.type} ${trade.pair} @ $${trade.price}`);
      } catch (error) {
        this.log('error', `Failed to execute prediction ${prediction.id}`, error);
      }
    }
    
    // Update positions
    await this.updatePositions();
    
    const execDuration = Date.now() - execStart;
    this.log('debug', `Execution cycle completed in ${execDuration}ms`);
  }

  /**
   * Reset the executor agent
   */
  protected async onReset(): Promise<void> {
    this.predictionQueue = [];
    this.log('info', 'Executor agent reset');
  }

  /**
   * Add a prediction to the execution queue
   */
  async addPrediction(prediction: Prediction): Promise<void> {
    this.predictionQueue.push(prediction);
    this.log('debug', `Prediction queued: ${prediction.action} ${prediction.pair}`);
  }

  /**
   * Execute a single trade based on a prediction
   */
  private async executeTrade(prediction: Prediction): Promise<Trade> {
    const { pair, action } = prediction;
    
    // Calculate trade size based on risk tolerance
    const tradeSize = this.calculateTradeSize(prediction);
    
    // Get optimal route via Jupiter aggregator
    const route = await this.solana.getOptimalRoute(pair, tradeSize, action);
    
    // Calculate slippage tolerance
    const slippageTolerance = this.calculateSlippageTolerance(prediction);
    
    // Build and sign transaction
    const transaction = await this.solana.buildTransaction({
      route,
      slippageTolerance,
      priorityFee: this.getPriorityFee(),
      wallet: this.selectWallet(),
    });
    
    // Execute transaction
    const signature = await this.solana.sendTransaction(transaction);
    
    // Wait for confirmation
    const confirmation = await this.solana.confirmTransaction(signature);
    
    if (!confirmation) {
      throw new Error('Transaction confirmation failed');
    }
    
    // Create trade record
    const trade: Trade = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pair,
      type: action === 'BUY' ? 'buy' : 'sell',
      amount: tradeSize,
      price: route.price,
      slippage: route.estimatedSlippage,
      signature,
      status: 'completed',
      timestamp: Date.now(),
      agent: this.id,
    };
    
    // Update position
    this.updatePosition(pair, trade);
    
    return trade;
  }

  /**
   * Determine if a prediction should be executed
   */
  private shouldExecute(prediction: Prediction): boolean {
    // Check confidence threshold
    if (prediction.confidence < 0.7) {
      return false;
    }
    
    // Check if we already have a position in this pair
    const existingPosition = this.positions.get(prediction.pair);
    if (existingPosition) {
      // Don't open opposite position
      if (
        (existingPosition.type === 'long' && prediction.action === 'SELL') ||
        (existingPosition.type === 'short' && prediction.action === 'BUY')
      ) {
        return false;
      }
    }
    
    // Check daily loss limit
    const todayPnL = this.calculateTodayPnL();
    if (
      this.tradingConfig.dailyLossLimit &&
      todayPnL < -this.tradingConfig.dailyLossLimit
    ) {
      this.log('warn', 'Daily loss limit reached, skipping execution');
      return false;
    }
    
    return true;
  }

  /**
   * Calculate trade size based on prediction and risk
   */
  private calculateTradeSize(prediction: Prediction): number {
    const baseSize = this.tradingConfig.maxPositionSize;
    
    // Adjust size based on confidence
    const confidenceMultiplier = prediction.confidence;
    
    // Adjust size based on risk tolerance
    const riskMultipliers = {
      low: 0.5,
      medium: 0.75,
      high: 1.0,
    };
    
    const riskMultiplier = riskMultipliers[prediction.riskTolerance];
    
    const tradeSize = baseSize * confidenceMultiplier * riskMultiplier;
    
    return Math.min(tradeSize, this.tradingConfig.maxPositionSize);
  }

  /**
   * Calculate slippage tolerance for a trade
   */
  private calculateSlippageTolerance(prediction: Prediction): number {
    const baseSlippage = this.config.options.maxSlippage;
    
    // Increase slippage for high-confidence trades
    if (prediction.confidence > 0.9) {
      return Math.min(baseSlippage * 1.5, this.tradingConfig.maxSlippage);
    }
    
    return baseSlippage;
  }

  /**
   * Get priority fee based on configuration
   */
  private getPriorityFee(): number {
    const feeLevels = {
      low: 1000,
      medium: 5000,
      high: 10000,
    };
    
    return feeLevels[this.config.options.priorityFee];
  }

  /**
   * Select a wallet for execution (round-robin)
   */
  private selectWallet(): string {
    const wallets = this.config.options.wallets;
    const index = this.trades.length % wallets.length;
    return wallets[index]!;
  }

  /**
   * Update position after a trade
   */
  private updatePosition(pair: string, trade: Trade): void {
    const existing = this.positions.get(pair);
    
    if (trade.type === 'buy') {
      if (existing) {
        // Add to existing long position
        existing.size += trade.amount;
        existing.avgEntry = (existing.avgEntry * existing.size + trade.price * trade.amount) / (existing.size + trade.amount);
      } else {
        // Open new long position
        this.positions.set(pair, {
          type: 'long',
          size: trade.amount,
          avgEntry: trade.price,
          openedAt: Date.now(),
        });
      }
    } else {
      if (existing && existing.type === 'long') {
        // Reduce or close long position
        existing.size -= trade.amount;
        if (existing.size <= 0) {
          this.positions.delete(pair);
        }
      }
    }
  }

  /**
   * Update all positions with current prices
   */
  private async updatePositions(): Promise<void> {
    for (const [pair, position] of this.positions.entries()) {
      const currentPrice = await this.solana.getPrice(pair);
      const unrealizedPnL = this.calculateUnrealizedPnL(position, currentPrice);
      position.unrealizedPnL = unrealizedPnL;
      position.currentPrice = currentPrice;
      
      // Check stop loss and take profit
      await this.checkRiskManagement(pair, position);
    }
  }

  /**
   * Check risk management rules for a position
   */
  private async checkRiskManagement(pair: string, position: Position): Promise<void> {
    if (!position.unrealizedPnL) return;
    
    const entryValue = position.size * position.avgEntry;
    const pnlPercent = (position.unrealizedPnL / entryValue) * 100;
    
    // Check stop loss
    if (
      this.tradingConfig.stopLoss &&
      pnlPercent < -this.tradingConfig.stopLoss
    ) {
      this.log('warn', `Stop loss triggered for ${pair}`);
      await this.closePosition(pair);
    }
    
    // Check take profit
    if (
      this.tradingConfig.takeProfit &&
      pnlPercent > this.tradingConfig.takeProfit
    ) {
      this.log('info', `Take profit triggered for ${pair}`);
      await this.closePosition(pair);
    }
  }

  /**
   * Close a specific position
   */
  private async closePosition(pair: string): Promise<void> {
    const position = this.positions.get(pair);
    if (!position) return;
    
    // Execute sell trade
    const prediction: Prediction = {
      id: `close-${pair}`,
      signalId: 'risk-management',
      pair,
      action: 'SELL',
      confidence: 1.0,
      strength: 1.0,
      timestamp: Date.now(),
      analyst: this.id,
      models: [],
      riskTolerance: 'high',
    };
    
    await this.executeTrade(prediction);
  }

  /**
   * Close all open positions
   */
  private async closeAllPositions(): Promise<void> {
    const pairs = Array.from(this.positions.keys());
    await Promise.all(pairs.map(pair => this.closePosition(pair)));
  }

  /**
   * Calculate unrealized PnL for a position
   */
  private calculateUnrealizedPnL(position: Position, currentPrice: number): number {
    if (position.type === 'long') {
      return (currentPrice - position.avgEntry) * position.size;
    }
    return (position.avgEntry - currentPrice) * position.size;
  }

  /**
   * Calculate total realized PnL
   */
  private calculateTotalPnL(): number {
    return this.trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  }

  /**
   * Calculate today's PnL
   */
  private calculateTodayPnL(): number {
    const today = new Date().setHours(0, 0, 0, 0);
    return this.trades
      .filter(t => t.timestamp >= today)
      .reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  }
}

/**
 * Trading position
 */
export interface Position {
  /** Position type */
  type: 'long' | 'short';
  /** Position size */
  size: number;
  /** Average entry price */
  avgEntry: number;
  /** Current price */
  currentPrice?: number;
  /** Unrealized PnL */
  unrealizedPnL?: number;
  /** Position open timestamp */
  openedAt: number;
}

/**
 * Executor agent statistics
 */
export interface ExecutorStats extends AgentStats {
  /** Total PnL */
  pnl: number;
  /** Number of winning trades */
  wins: number;
  /** Number of losing trades */
  losses: number;
  /** Total trades executed */
  tradeCount: number;
  /** Win rate percentage */
  winRate: number;
  /** Total trade volume */
  totalTradeSize: number;
  /** Number of active positions */
  activePositions: number;
  /** Wallet addresses */
  wallets: string[];
}
