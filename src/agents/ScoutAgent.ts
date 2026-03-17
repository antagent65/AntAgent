import { BaseAgent, AgentStats } from './BaseAgent.js';
import { ScoutConfig, Signal, SignalType } from '../types/index.js';
import { OpenClawEngine } from '../openclaw/core.js';
import { SolanaProvider } from '../solana/provider.js';
import { logger } from '../utils/logger.js';

/**
 * Scout Agent - Data Collection and Signal Detection
 * 
 * Monitors on-chain and off-chain data sources to detect
 * trading opportunities and market signals.
 */
export class ScoutAgent extends BaseAgent {
  /** Scout-specific configuration */
  private config: ScoutConfig;
  
  /** Solana provider for on-chain data */
  private solana: SolanaProvider;
  
  /** OpenClaw engine for signal processing */
  private openClaw: OpenClawEngine;
  
  /** Detected signals queue */
  private signalQueue: Signal[];
  
  /** Last scan timestamp */
  private lastScan: number;

  /**
   * Create a new scout agent
   * @param config - Scout configuration
   * @param solana - Solana provider instance
   * @param openClaw - OpenClaw engine instance
   */
  constructor(
    config: ScoutConfig,
    solana: SolanaProvider,
    openClaw: OpenClawEngine
  ) {
    super(config);
    this.config = config;
    this.solana = solana;
    this.openClaw = openClaw;
    this.signalQueue = [];
    this.lastScan = 0;
  }

  /**
   * Get scout-specific statistics
   */
  getStats(): ScoutStats {
    const baseStats = super.getStats();
    return {
      ...baseStats,
      signalsDetected: this.signalQueue.length,
      lastScan: this.lastScan,
      targets: this.config.options.targets,
    };
  }

  /**
   * Initialize the scout agent
   */
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing scout agent...');
    
    // Validate targets
    const validTargets = [
      'new_pools',
      'whale_alerts',
      'price_movement',
      'volume_spike',
      'social_trend',
      'liquidity_change',
    ];
    
    const invalidTargets = this.config.options.targets.filter(
      target => !validTargets.includes(target)
    );
    
    if (invalidTargets.length > 0) {
      throw new Error(`Invalid scout targets: ${invalidTargets.join(', ')}`);
    }
    
    this.log('info', `Scout configured for targets: ${this.config.options.targets.join(', ')}`);
  }

  /**
   * Start the scout's monitoring loop
   */
  protected async onStart(): Promise<void> {
    this.log('info', 'Starting scout monitoring...');
    
    // Set up WebSocket subscriptions for real-time data
    if (this.config.options.targets.includes('new_pools')) {
      await this.subscribeToNewPools();
    }
    
    if (this.config.options.targets.includes('whale_alerts')) {
      await this.subscribeToWhaleAlerts();
    }
    
    this.log('info', 'Scout monitoring started');
  }

  /**
   * Stop the scout's monitoring loop
   */
  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping scout monitoring...');
    
    // Clean up subscriptions
    await this.cleanupSubscriptions();
    
    this.log('info', 'Scout monitoring stopped');
  }

  /**
   * Pause the scout's monitoring
   */
  protected async onPause(): Promise<void> {
    this.log('info', 'Pausing scout monitoring...');
    // Pause subscriptions but keep them active
  }

  /**
   * Resume the scout's monitoring
   */
  protected async onResume(): Promise<void> {
    this.log('info', 'Resuming scout monitoring...');
    // Resume subscriptions
  }

  /**
   * Execute the scout's main scanning logic
   */
  protected async onExecute(): Promise<void> {
    const scanStart = Date.now();
    this.lastScan = scanStart;
    
    const targets = this.config.options.targets;
    const signals: Signal[] = [];
    
    // Scan for new pools
    if (targets.includes('new_pools')) {
      const poolSignals = await this.scanNewPools();
      signals.push(...poolSignals);
    }
    
    // Scan for whale movements
    if (targets.includes('whale_alerts')) {
      const whaleSignals = await this.scanWhaleAlerts();
      signals.push(...whaleSignals);
    }
    
    // Scan for price movements
    if (targets.includes('price_movement')) {
      const priceSignals = await this.scanPriceMovements();
      signals.push(...priceSignals);
    }
    
    // Scan for volume spikes
    if (targets.includes('volume_spike')) {
      const volumeSignals = await this.scanVolumeSpikes();
      signals.push(...volumeSignals);
    }
    
    // Process and filter signals
    const validSignals = signals.filter(
      signal => signal.strength >= this.config.options.signalThreshold
    );
    
    // Add to queue and emit
    for (const signal of validSignals) {
      this.signalQueue.push(signal);
      this.emit('signal', signal);
      this.log('debug', `Signal detected: ${signal.type} (strength: ${signal.strength})`);
    }
    
    // Send signals to OpenClaw for processing
    if (validSignals.length > 0) {
      await this.openClaw.processSignals(validSignals);
    }
    
    const scanDuration = Date.now() - scanStart;
    this.log('debug', `Scan completed in ${scanDuration}ms - ${validSignals.length} signals detected`);
  }

  /**
   * Reset the scout agent
   */
  protected async onReset(): Promise<void> {
    this.signalQueue = [];
    this.lastScan = 0;
    this.log('info', 'Scout agent reset');
  }

  /**
   * Subscribe to new pool events
   */
  private async subscribeToNewPools(): Promise<void> {
    this.log('debug', 'Subscribing to new pool events...');
    // Implementation: Subscribe to Raydium/Orca pool creation events
  }

  /**
   * Subscribe to whale alert events
   */
  private async subscribeToWhaleAlerts(): Promise<void> {
    this.log('debug', 'Subscribing to whale alert events...');
    // Implementation: Subscribe to large transfer events
  }

  /**
   * Clean up WebSocket subscriptions
   */
  private async cleanupSubscriptions(): Promise<void> {
    this.log('debug', 'Cleaning up subscriptions...');
    // Implementation: Unsubscribe from all events
  }

  /**
   * Scan for new liquidity pools
   */
  private async scanNewPools(): Promise<Signal[]> {
    const pools = await this.solana.getNewPools();
    
    return pools.map(pool => ({
      id: this.generateSignalId('pool'),
      type: 'new_pool' as SignalType,
      strength: this.calculatePoolSignalStrength(pool),
      timestamp: Date.now(),
      source: this.id,
      data: pool,
      validated: false,
    }));
  }

  /**
   * Scan for whale movements
   */
  private async scanWhaleAlerts(): Promise<Signal[]> {
    const movements = await this.solana.getWhaleMovements();
    
    return movements.map(movement => ({
      id: this.generateSignalId('whale'),
      type: 'whale_alert' as SignalType,
      strength: this.calculateWhaleSignalStrength(movement),
      timestamp: Date.now(),
      source: this.id,
      data: movement,
      validated: false,
    }));
  }

  /**
   * Scan for significant price movements
   */
  private async scanPriceMovements(): Promise<Signal[]> {
    const movements = await this.solana.getPriceMovements();
    
    return movements
      .filter(movement => Math.abs(movement.changePercent) > 5) // 5% threshold
      .map(movement => ({
        id: this.generateSignalId('price'),
        type: 'price_movement' as SignalType,
        strength: Math.min(Math.abs(movement.changePercent) / 10, 1),
        timestamp: Date.now(),
        source: this.id,
        data: movement,
        validated: false,
      }));
  }

  /**
   * Scan for volume spikes
   */
  private async scanVolumeSpikes(): Promise<Signal[]> {
    const spikes = await this.solana.getVolumeSpikes();
    
    return spikes.map(spike => ({
      id: this.generateSignalId('volume'),
      type: 'volume_spike' as SignalType,
      strength: Math.min(spike.ratio, 1),
      timestamp: Date.now(),
      source: this.id,
      data: spike,
      validated: false,
    }));
  }

  /**
   * Calculate signal strength for pool detection
   */
  private calculatePoolSignalStrength(pool: Record<string, unknown>): number {
    const liquidity = (pool.liquidity as number) || 0;
    const volume = (pool.volume24h as number) || 0;
    
    // Higher liquidity and volume = stronger signal
    const liquidityScore = Math.min(liquidity / 100000, 0.5);
    const volumeScore = Math.min(volume / 50000, 0.5);
    
    return liquidityScore + volumeScore;
  }

  /**
   * Calculate signal strength for whale alerts
   */
  private calculateWhaleSignalStrength(movement: Record<string, unknown>): number {
    const value = (movement.value as number) || 0;
    
    // Higher value = stronger signal
    return Math.min(value / 1000000, 1); // $1M+ = max strength
  }

  /**
   * Generate a unique signal ID
   */
  private generateSignalId(prefix: string): string {
    return `${prefix}-${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Scout agent statistics
 */
export interface ScoutStats extends AgentStats {
  /** Total signals detected */
  signalsDetected: number;
  /** Last scan timestamp */
  lastScan: number;
  /** Monitored targets */
  targets: string[];
}
