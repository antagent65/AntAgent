import { EventEmitter } from 'eventemitter3';
import { BaseAgent } from './BaseAgent.js';
import { ScoutAgent } from './ScoutAgent.js';
import { AnalystAgent } from './AnalystAgent.js';
import { ExecutorAgent } from './ExecutorAgent.js';
import { LearningAgent } from './LearningAgent.js';
import {
  ColonyConfig,
  ColonyStatus,
  ColonyMetrics,
  AgentType,
  ScoutConfig,
  AnalystConfig,
  ExecutorConfig,
  LearningConfig,
} from '../types/index.js';
import { OpenClawEngine } from '../openclaw/core.js';
import { SolanaProvider } from '../solana/provider.js';
import { logger } from '../utils/logger.js';

/**
 * Main ANT AGENT Colony Class
 * 
 * Orchestrates multiple AI agents working together as a colony
 * to perform autonomous trading on Solana.
 */
export class AntAgent extends EventEmitter {
  /** Colony configuration */
  private config: ColonyConfig;
  
  /** OpenClaw engine instance */
  private openClaw: OpenClawEngine;
  
  /** Solana blockchain provider */
  private solana: SolanaProvider;
  
  /** Active agents in the colony */
  private agents: Map<string, BaseAgent>;
  
  /** Colony start timestamp */
  private startTime: number | null;
  
  /** Running state */
  private isRunning: boolean;

  /**
   * Create a new ANT AGENT colony
   * @param config - Colony configuration
   */
  constructor(config: ColonyConfig) {
    super();
    this.config = config;
    this.openClaw = new OpenClawEngine(config.openclaw);
    this.solana = new SolanaProvider(config.solana);
    this.agents = new Map();
    this.startTime = null;
    this.isRunning = false;
  }

  /**
   * Initialize the colony and all subsystems
   */
  async initialize(): Promise<void> {
    logger.info('Initializing ANT AGENT colony...');
    
    try {
      // Initialize OpenClaw engine
      await this.openClaw.initialize();
      logger.info('OpenClaw engine initialized');
      
      // Initialize Solana provider
      await this.solana.initialize();
      logger.info('Solana provider initialized');
      
      logger.info('ANT AGENT colony initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize colony', error);
      throw error;
    }
  }

  /**
   * Deploy a new scout agent
   * @param options - Scout agent configuration
   * @returns The deployed scout agent
   */
  async deployScout(options: ScoutConfig['options']): Promise<ScoutAgent> {
    const maxScouts = this.config.agents.maxScouts;
    const currentScouts = this.getAgentsByType('scout').length;
    
    if (currentScouts >= maxScouts) {
      throw new Error(`Maximum scout limit reached: ${maxScouts}`);
    }
    
    const name = `Scout-${this.generateAgentId('scout')}`;
    const config: ScoutConfig = {
      name,
      type: 'scout',
      options,
      verbose: this.config.logging.level === 'debug',
    };
    
    const scout = new ScoutAgent(config, this.solana, this.openClaw);
    await scout.initialize();
    
    this.agents.set(name, scout);
    this.setupAgentListeners(scout);
    
    logger.info({ name, type: 'scout' }, 'Scout agent deployed');
    return scout;
  }

  /**
   * Deploy a new analyst agent
   * @param options - Analyst agent configuration
   * @returns The deployed analyst agent
   */
  async deployAnalyst(options: AnalystConfig['options']): Promise<AnalystAgent> {
    const maxAnalysts = this.config.agents.maxAnalysts;
    const currentAnalysts = this.getAgentsByType('analyst').length;
    
    if (currentAnalysts >= maxAnalysts) {
      throw new Error(`Maximum analyst limit reached: ${maxAnalysts}`);
    }
    
    const name = `Analyst-${this.generateAgentId('analyst')}`;
    const config: AnalystConfig = {
      name,
      type: 'analyst',
      options,
      verbose: this.config.logging.level === 'debug',
    };
    
    const analyst = new AnalystAgent(config, this.openClaw);
    await analyst.initialize();
    
    this.agents.set(name, analyst);
    this.setupAgentListeners(analyst);
    
    logger.info({ name, type: 'analyst' }, 'Analyst agent deployed');
    return analyst;
  }

  /**
   * Deploy a new executor agent
   * @param options - Executor agent configuration
   * @returns The deployed executor agent
   */
  async deployExecutor(options: ExecutorConfig['options']): Promise<ExecutorAgent> {
    const maxExecutors = this.config.agents.maxExecutors;
    const currentExecutors = this.getAgentsByType('executor').length;
    
    if (currentExecutors >= maxExecutors) {
      throw new Error(`Maximum executor limit reached: ${maxExecutors}`);
    }
    
    const name = `Executor-${this.generateAgentId('executor')}`;
    const config: ExecutorConfig = {
      name,
      type: 'executor',
      options,
      verbose: this.config.logging.level === 'debug',
    };
    
    const executor = new ExecutorAgent(config, this.solana, this.config.trading);
    await executor.initialize();
    
    this.agents.set(name, executor);
    this.setupAgentListeners(executor);
    
    logger.info({ name, type: 'executor' }, 'Executor agent deployed');
    return executor;
  }

  /**
   * Deploy a new learning agent
   * @param options - Learning agent configuration
   * @returns The deployed learning agent
   */
  async deployLearning(options: LearningConfig['options']): Promise<LearningAgent> {
    if (!this.config.agents.learningEnabled) {
      throw new Error('Learning agents are disabled in configuration');
    }
    
    const name = `Learning-${this.generateAgentId('learning')}`;
    const config: LearningConfig = {
      name,
      type: 'learning',
      options,
      verbose: this.config.logging.level === 'debug',
    };
    
    const learning = new LearningAgent(config, this.openClaw);
    await learning.initialize();
    
    this.agents.set(name, learning);
    this.setupAgentListeners(learning);
    
    logger.info({ name, type: 'learning' }, 'Learning agent deployed');
    return learning;
  }

  /**
   * Start the entire colony
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Colony is already running');
      return;
    }
    
    logger.info('Starting ANT AGENT colony...');
    
    try {
      // Start all agents
      const startPromises = Array.from(this.agents.values()).map(agent =>
        agent.start()
      );
      await Promise.all(startPromises);
      
      this.startTime = Date.now();
      this.isRunning = true;
      
      this.emit('started', { timestamp: Date.now() });
      logger.info('ANT AGENT colony started successfully');
    } catch (error) {
      logger.error('Failed to start colony', error);
      throw error;
    }
  }

  /**
   * Stop the entire colony
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Colony is not running');
      return;
    }
    
    logger.info('Stopping ANT AGENT colony...');
    
    try {
      // Stop all agents
      const stopPromises = Array.from(this.agents.values()).map(agent =>
        agent.stop()
      );
      await Promise.all(stopPromises);
      
      this.isRunning = false;
      this.startTime = null;
      
      this.emit('stopped', { timestamp: Date.now() });
      logger.info('ANT AGENT colony stopped successfully');
    } catch (error) {
      logger.error('Error while stopping colony', error);
      throw error;
    }
  }

  /**
   * Pause all agents in the colony
   */
  async pause(): Promise<void> {
    logger.info('Pausing ANT AGENT colony...');
    
    const pausePromises = Array.from(this.agents.values()).map(agent =>
      agent.pause()
    );
    await Promise.all(pausePromises);
    
    this.emit('paused', { timestamp: Date.now() });
    logger.info('ANT AGENT colony paused');
  }

  /**
   * Resume all agents in the colony
   */
  async resume(): Promise<void> {
    logger.info('Resuming ANT AGENT colony...');
    
    const resumePromises = Array.from(this.agents.values()).map(agent =>
      agent.resume()
    );
    await Promise.all(resumePromises);
    
    this.emit('resumed', { timestamp: Date.now() });
    logger.info('ANT AGENT colony resumed');
  }

  /**
   * Get the current colony status
   */
  getStatus(): ColonyStatus {
    const agentsByType = {
      scout: this.getAgentsByType('scout').length,
      analyst: this.getAgentsByType('analyst').length,
      executor: this.getAgentsByType('executor').length,
      learning: this.getAgentsByType('learning').length,
    };
    
    const activeAgents = Array.from(this.agents.values()).filter(
      agent => agent.getStatus() === 'running'
    ).length;
    
    const metrics = this.getMetrics();
    
    return {
      isRunning: this.isRunning,
      activeAgents,
      agentsByType,
      totalTrades: metrics.totalTrades,
      totalPnl: metrics.totalPnl,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Get colony performance metrics
   */
  getMetrics(): ColonyMetrics {
    // Aggregate metrics from all agents
    const executorAgents = this.getAgentsByType('executor') as ExecutorAgent[];
    
    let totalPnl = 0;
    let totalTrades = 0;
    let totalTradeSize = 0;
    
    const agentPerformance: Array<{ name: string; pnl: number }> = [];
    
    executorAgents.forEach(agent => {
      const stats = agent.getStats();
      totalPnl += stats.pnl;
      totalTrades += stats.tradeCount;
      totalTradeSize += stats.totalTradeSize;
      agentPerformance.push({ name: agent.id, pnl: stats.pnl });
    });
    
    // Sort by performance
    agentPerformance.sort((a, b) => b.pnl - a.pnl);
    
    const bestAgent = agentPerformance[0]?.name || 'N/A';
    const worstAgent = agentPerformance[agentPerformance.length - 1]?.name || 'N/A';
    
    const wins = executorAgents.reduce((sum, agent) => sum + agent.getStats().wins, 0);
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    return {
      totalPnl,
      winRate,
      totalTrades,
      avgTradeSize: totalTrades > 0 ? totalTradeSize / totalTrades : 0,
      bestAgent,
      worstAgent,
      window: '24h',
      timestamp: Date.now(),
    };
  }

  /**
   * Get a specific agent by name
   * @param name - Agent name
   * @returns The agent or undefined if not found
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all agents of a specific type
   * @param type - Agent type
   * @returns Array of agents
   */
  getAgentsByType(type: AgentType): BaseAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  /**
   * Get all active agents
   * @returns Array of all agents
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Remove an agent from the colony
   * @param name - Agent name
   */
  async removeAgent(name: string): Promise<void> {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent not found: ${name}`);
    }
    
    await agent.stop();
    this.agents.delete(name);
    
    logger.info({ name }, 'Agent removed from colony');
  }

  /**
   * Set up event listeners for an agent
   */
  private setupAgentListeners(agent: BaseAgent): void {
    agent.on('executed', (data) => {
      this.emit('agent:executed', { ...data, agent: agent.id });
    });
    
    agent.on('error', (data) => {
      this.emit('agent:error', { ...data, agent: agent.id });
    });
    
    agent.on('started', (data) => {
      this.emit('agent:started', { ...data, agent: agent.id });
    });
    
    agent.on('stopped', (data) => {
      this.emit('agent:stopped', { ...data, agent: agent.id });
    });
  }

  /**
   * Generate a unique agent ID
   */
  private generateAgentId(type: AgentType): string {
    const prefix = type.charAt(0).toUpperCase() + type.slice(1);
    const existing = this.getAgentsByType(type);
    const id = existing.length + 1;
    return `${prefix}-${id.toString().padStart(3, '0')}`;
  }
}
