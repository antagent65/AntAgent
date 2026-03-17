import { EventEmitter } from 'eventemitter3';
import { AgentConfig, AgentStatus, AgentType } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Base class for all ANT AGENT agents
 * 
 * Provides common functionality and lifecycle management
 * for all agent types in the colony.
 */
export abstract class BaseAgent extends EventEmitter {
  /** Agent configuration */
  protected config: AgentConfig;
  
  /** Current agent status */
  protected status: AgentStatus;
  
  /** Agent start timestamp */
  protected startTime: number | null;
  
  /** Execution counter */
  protected executionCount: number;
  
  /** Error counter */
  protected errorCount: number;
  
  /** Last execution timestamp */
  protected lastExecution: number | null;

  /**
   * Create a new base agent
   * @param config - Agent configuration
   */
  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.status = AgentStatus.IDLE;
    this.startTime = null;
    this.executionCount = 0;
    this.errorCount = 0;
    this.lastExecution = null;
  }

  /**
   * Get the agent's unique identifier
   */
  get id(): string {
    return this.config.name;
  }

  /**
   * Get the agent type
   */
  get type(): AgentType {
    return this.config.type;
  }

  /**
   * Get the current agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get execution statistics
   */
  getStats(): AgentStats {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      executionCount: this.executionCount,
      errorCount: this.errorCount,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      lastExecution: this.lastExecution,
    };
  }

  /**
   * Initialize the agent
   * Called once when the agent is first created
   */
  async initialize(): Promise<void> {
    this.log('debug', 'Initializing agent...');
    
    try {
      await this.onInitialize();
      this.status = AgentStatus.IDLE;
      this.log('info', 'Agent initialized successfully');
    } catch (error) {
      this.status = AgentStatus.ERROR;
      this.log('error', 'Failed to initialize agent', error);
      throw error;
    }
  }

  /**
   * Start the agent's main execution loop
   */
  async start(): Promise<void> {
    if (this.status === AgentStatus.RUNNING) {
      this.log('warn', 'Agent is already running');
      return;
    }

    this.log('info', 'Starting agent...');
    
    try {
      await this.onStart();
      this.status = AgentStatus.RUNNING;
      this.startTime = Date.now();
      this.emit('started', { agent: this.id, timestamp: Date.now() });
      this.log('info', 'Agent started successfully');
    } catch (error) {
      this.status = AgentStatus.ERROR;
      this.log('error', 'Failed to start agent', error);
      throw error;
    }
  }

  /**
   * Stop the agent's execution loop
   */
  async stop(): Promise<void> {
    if (this.status === AgentStatus.STOPPED) {
      this.log('warn', 'Agent is already stopped');
      return;
    }

    this.log('info', 'Stopping agent...');
    
    try {
      await this.onStop();
      this.status = AgentStatus.STOPPED;
      this.emit('stopped', { agent: this.id, timestamp: Date.now() });
      this.log('info', 'Agent stopped successfully');
    } catch (error) {
      this.log('error', 'Error while stopping agent', error);
      throw error;
    }
  }

  /**
   * Pause the agent's execution
   */
  async pause(): Promise<void> {
    if (this.status !== AgentStatus.RUNNING) {
      this.log('warn', 'Can only pause a running agent');
      return;
    }

    this.log('info', 'Pausing agent...');
    
    try {
      await this.onPause();
      this.status = AgentStatus.PAUSED;
      this.emit('paused', { agent: this.id, timestamp: Date.now() });
      this.log('info', 'Agent paused successfully');
    } catch (error) {
      this.log('error', 'Error while pausing agent', error);
      throw error;
    }
  }

  /**
   * Resume the agent's execution after pause
   */
  async resume(): Promise<void> {
    if (this.status !== AgentStatus.PAUSED) {
      this.log('warn', 'Can only resume a paused agent');
      return;
    }

    this.log('info', 'Resuming agent...');
    
    try {
      await this.onResume();
      this.status = AgentStatus.RUNNING;
      this.emit('resumed', { agent: this.id, timestamp: Date.now() });
      this.log('info', 'Agent resumed successfully');
    } catch (error) {
      this.status = AgentStatus.ERROR;
      this.log('error', 'Error while resuming agent', error);
      throw error;
    }
  }

  /**
   * Execute the agent's main logic
   * Called by the colony orchestrator
   */
  async execute(): Promise<void> {
    if (this.status !== AgentStatus.RUNNING) {
      this.log('debug', 'Skipping execution - agent not running');
      return;
    }

    const execStart = Date.now();
    
    try {
      await this.onExecute();
      this.executionCount++;
      this.lastExecution = Date.now();
      
      const duration = Date.now() - execStart;
      this.emit('executed', {
        agent: this.id,
        duration,
        timestamp: Date.now(),
      });
      
      this.log('debug', `Execution completed in ${duration}ms`);
    } catch (error) {
      this.errorCount++;
      this.status = AgentStatus.ERROR;
      this.emit('error', { agent: this.id, error, timestamp: Date.now() });
      this.log('error', 'Execution failed', error);
      throw error;
    }
  }

  /**
   * Reset the agent's error state
   */
  async reset(): Promise<void> {
    this.log('info', 'Resetting agent...');
    
    try {
      await this.onReset();
      this.status = AgentStatus.IDLE;
      this.errorCount = 0;
      this.emit('reset', { agent: this.id, timestamp: Date.now() });
      this.log('info', 'Agent reset successfully');
    } catch (error) {
      this.log('error', 'Error while resetting agent', error);
      throw error;
    }
  }

  /**
   * Log a message with the agent's context
   */
  protected log(level: string, message: string, data?: unknown): void {
    const context = {
      agent: this.id,
      type: this.type,
      status: this.status,
    };
    
    logger[level]({ ...context, data }, message);
  }

  /**
   * Override in subclass for initialization logic
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Override in subclass for start logic
   */
  protected abstract onStart(): Promise<void>;

  /**
   * Override in subclass for stop logic
   */
  protected abstract onStop(): Promise<void>;

  /**
   * Override in subclass for pause logic
   */
  protected abstract onPause(): Promise<void>;

  /**
   * Override in subclass for resume logic
   */
  protected abstract onResume(): Promise<void>;

  /**
   * Override in subclass for main execution logic
   */
  protected abstract onExecute(): Promise<void>;

  /**
   * Override in subclass for reset logic
   */
  protected abstract onReset(): Promise<void>;
}

/**
 * Agent statistics interface
 */
export interface AgentStats {
  /** Agent identifier */
  id: string;
  /** Agent type */
  type: AgentType;
  /** Current status */
  status: AgentStatus;
  /** Total executions */
  executionCount: number;
  /** Total errors */
  errorCount: number;
  /** Uptime in milliseconds */
  uptime: number;
  /** Last execution timestamp */
  lastExecution: number | null;
}
