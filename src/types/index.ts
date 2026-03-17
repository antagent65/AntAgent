/**
 * Core type definitions for ANT AGENT
 */

/**
 * Agent configuration options
 */
export interface AgentConfig {
  /** Unique agent identifier */
  name: string;
  /** Agent type */
  type: AgentType;
  /** Agent-specific configuration */
  options: Record<string, unknown>;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Available agent types in the colony
 */
export type AgentType = 'scout' | 'analyst' | 'executor' | 'learning';

/**
 * Agent operational status
 */
export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
  STOPPED = 'stopped',
}

/**
 * Market signal detected by scout agents
 */
export interface Signal {
  /** Unique signal identifier */
  id: string;
  /** Signal type */
  type: SignalType;
  /** Signal strength (0-1) */
  strength: number;
  /** Timestamp of signal detection */
  timestamp: number;
  /** Source agent */
  source: string;
  /** Signal data payload */
  data: Record<string, unknown>;
  /** Validation status */
  validated: boolean;
}

/**
 * Types of market signals
 */
export type SignalType =
  | 'new_pool'
  | 'whale_alert'
  | 'price_movement'
  | 'volume_spike'
  | 'social_trend'
  | 'liquidity_change';

/**
 * Trade execution record
 */
export interface Trade {
  /** Unique trade identifier */
  id: string;
  /** Trading pair */
  pair: string;
  /** Trade type (buy/sell) */
  type: 'buy' | 'sell';
  /** Trade amount */
  amount: number;
  /** Execution price */
  price: number;
  /** Slippage percentage */
  slippage: number;
  /** Transaction signature */
  signature?: string;
  /** Trade status */
  status: TradeStatus;
  /** Timestamp */
  timestamp: number;
  /** Profit/Loss */
  pnl?: number;
  /** Executing agent */
  agent: string;
}

/**
 * Trade execution status
 */
export type TradeStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Colony-wide configuration
 */
export interface ColonyConfig {
  /** Solana configuration */
  solana: SolanaConfig;
  /** OpenClaw configuration */
  openclaw: OpenClawConfig;
  /** Trading configuration */
  trading: TradingConfig;
  /** Agent limits and settings */
  agents: AgentLimits;
  /** Logging configuration */
  logging: LoggingConfig;
}

/**
 * Solana blockchain configuration
 */
export interface SolanaConfig {
  /** RPC endpoint URL */
  rpcUrl: string;
  /** WebSocket endpoint URL */
  wsEndpoint?: string;
  /** Commitment level */
  commitment: 'processed' | 'confirmed' | 'finalized';
  /** Transaction priority fee */
  priorityFee?: number;
}

/**
 * OpenClaw AI framework configuration
 */
export interface OpenClawConfig {
  /** API key for OpenClaw */
  apiKey: string;
  /** Colony identifier */
  colony: string;
  /** Heartbeat interval (ms) */
  heartbeatInterval?: number;
  /** Enable learning loops */
  enableLearning?: boolean;
}

/**
 * Trading parameters
 */
export interface TradingConfig {
  /** Maximum allowed slippage (%) */
  maxSlippage: number;
  /** Default transaction priority */
  defaultPriority: 'low' | 'medium' | 'high';
  /** Maximum position size (USD) */
  maxPositionSize: number;
  /** Stop loss percentage */
  stopLoss?: number;
  /** Take profit percentage */
  takeProfit?: number;
  /** Daily loss limit (USD) */
  dailyLossLimit?: number;
}

/**
 * Agent deployment limits
 */
export interface AgentLimits {
  /** Maximum scout agents */
  maxScouts: number;
  /** Maximum analyst agents */
  maxAnalysts: number;
  /** Maximum executor agents */
  maxExecutors: number;
  /** Enable automatic learning */
  learningEnabled: boolean;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** Log file path */
  file?: string;
  /** Enable console logging */
  console: boolean;
}

/**
 * Colony operational status
 */
export interface ColonyStatus {
  /** Colony running state */
  isRunning: boolean;
  /** Number of active agents */
  activeAgents: number;
  /** Agent status breakdown */
  agentsByType: Record<AgentType, number>;
  /** Total trades executed */
  totalTrades: number;
  /** Total PnL */
  totalPnl: number;
  /** Uptime in seconds */
  uptime: number;
  /** Last update timestamp */
  lastUpdate: number;
}

/**
 * Colony performance metrics
 */
export interface ColonyMetrics {
  /** Total PnL across all agents */
  totalPnl: number;
  /** Win rate percentage */
  winRate: number;
  /** Total trades executed */
  totalTrades: number;
  /** Average trade size */
  avgTradeSize: number;
  /** Best performing agent */
  bestAgent: string;
  /** Worst performing agent */
  worstAgent: string;
  /** Metrics time window */
  window: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Agent-specific configuration extensions
 */
export interface ScoutConfig extends AgentConfig {
  type: 'scout';
  options: {
    /** Targets to monitor */
    targets: string[];
    /** Scan interval (ms) */
    updateInterval: number;
    /** Minimum signal strength */
    signalThreshold: number;
  };
}

export interface AnalystConfig extends AgentConfig {
  type: 'analyst';
  options: {
    /** ML models to use */
    models: string[];
    /** Confidence threshold */
    confidenceThreshold: number;
    /** Risk tolerance */
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

export interface ExecutorConfig extends AgentConfig {
  type: 'executor';
  options: {
    /** Maximum slippage (%) */
    maxSlippage: number;
    /** Priority fee level */
    priorityFee: 'low' | 'medium' | 'high';
    /** Enable order splitting */
    splitOrders: boolean;
    /** Wallet addresses */
    wallets: string[];
  };
}

export interface LearningConfig extends AgentConfig {
  type: 'learning';
  options: {
    /** Learning rate */
    learningRate: number;
    /** Evaluation window */
    evaluationWindow: string;
    /** Adaptation speed */
    adaptationSpeed: 'conservative' | 'moderate' | 'aggressive';
  };
}

/**
 * Union type for all agent configurations
 */
export type AnyAgentConfig =
  | ScoutConfig
  | AnalystConfig
  | ExecutorConfig
  | LearningConfig;
