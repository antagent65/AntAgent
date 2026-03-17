import { BaseAgent, AgentStats } from './BaseAgent.js';
import { AnalystConfig, Signal, Trade } from '../types/index.js';
import { OpenClawEngine } from '../openclaw/core.js';
import { logger } from '../utils/logger.js';

/**
 * Analyst Agent - Data Analysis and Prediction
 * 
 * Processes signals from scout agents using AI models
 * to generate trading predictions and recommendations.
 */
export class AnalystAgent extends BaseAgent {
  /** Analyst-specific configuration */
  private config: AnalystConfig;
  
  /** OpenClaw engine for AI processing */
  private openClaw: OpenClawEngine;
  
  /** Pending signals to analyze */
  private signalQueue: Signal[];
  
  /** Generated predictions */
  private predictions: Prediction[];

  /**
   * Create a new analyst agent
   * @param config - Analyst configuration
   * @param openClaw - OpenClaw engine instance
   */
  constructor(
    config: AnalystConfig,
    openClaw: OpenClawEngine
  ) {
    super(config);
    this.config = config;
    this.openClaw = openClaw;
    this.signalQueue = [];
    this.predictions = [];
  }

  /**
   * Get analyst-specific statistics
   */
  getStats(): AnalystStats {
    const baseStats = super.getStats();
    return {
      ...baseStats,
      signalsAnalyzed: this.predictions.length,
      avgConfidence: this.calculateAverageConfidence(),
      models: this.config.options.models,
    };
  }

  /**
   * Initialize the analyst agent
   */
  protected async onInitialize(): Promise<void> {
    this.log('info', 'Initializing analyst agent...');
    
    // Validate models
    const validModels = [
      'momentum',
      'mean_reversion',
      'breakout',
      'trend_following',
      'ml_classifier',
    ];
    
    const invalidModels = this.config.options.models.filter(
      model => !validModels.includes(model)
    );
    
    if (invalidModels.length > 0) {
      throw new Error(`Invalid analyst models: ${invalidModels.join(', ')}`);
    }
    
    this.log('info', `Analyst configured with models: ${this.config.options.models.join(', ')}`);
  }

  /**
   * Start the analyst's analysis loop
   */
  protected async onStart(): Promise<void> {
    this.log('info', 'Starting analyst processing...');
    
    // Set up signal subscription from OpenClaw
    this.openClaw.on('signal', (signal: Signal) => {
      this.signalQueue.push(signal);
      this.log('debug', `Signal queued for analysis: ${signal.type}`);
    });
    
    this.log('info', 'Analyst processing started');
  }

  /**
   * Stop the analyst's analysis loop
   */
  protected async onStop(): Promise<void> {
    this.log('info', 'Stopping analyst processing...');
    
    // Clean up
    this.signalQueue = [];
    
    this.log('info', 'Analyst processing stopped');
  }

  /**
   * Pause the analyst's processing
   */
  protected async onPause(): Promise<void> {
    this.log('info', 'Pausing analyst processing...');
  }

  /**
   * Resume the analyst's processing
   */
  protected async onResume(): Promise<void> {
    this.log('info', 'Resuming analyst processing...');
  }

  /**
   * Execute the analyst's main analysis logic
   */
  protected async onExecute(): Promise<void> {
    const analysisStart = Date.now();
    
    if (this.signalQueue.length === 0) {
      this.log('debug', 'No signals to analyze');
      return;
    }
    
    const signalsToAnalyze = [...this.signalQueue];
    this.signalQueue = [];
    
    const predictions: Prediction[] = [];
    
    // Analyze each signal
    for (const signal of signalsToAnalyze) {
      try {
        const prediction = await this.analyzeSignal(signal);
        
        // Only emit predictions above confidence threshold
        if (prediction.confidence >= this.config.options.confidenceThreshold) {
          predictions.push(prediction);
          this.predictions.push(prediction);
          this.emit('prediction', prediction);
          
          this.log('info', `Prediction generated: ${prediction.action} ${prediction.pair} (confidence: ${prediction.confidence})`);
        } else {
          this.log('debug', `Prediction below threshold: ${prediction.confidence}`);
        }
      } catch (error) {
        this.log('error', `Failed to analyze signal ${signal.id}`, error);
      }
    }
    
    // Send high-confidence predictions to executor agents
    const highConfidencePredictions = predictions.filter(
      p => p.confidence >= 0.8
    );
    
    if (highConfidencePredictions.length > 0) {
      await this.openClaw.distributePredictions(highConfidencePredictions);
    }
    
    const analysisDuration = Date.now() - analysisStart;
    this.log('debug', `Analysis completed in ${analysisDuration}ms - ${predictions.length} predictions generated`);
  }

  /**
   * Reset the analyst agent
   */
  protected async onReset(): Promise<void> {
    this.signalQueue = [];
    this.predictions = [];
    this.log('info', 'Analyst agent reset');
  }

  /**
   * Analyze a single signal using configured models
   */
  private async analyzeSignal(signal: Signal): Promise<Prediction> {
    const modelResults: ModelResult[] = [];
    
    // Run each configured model
    for (const modelName of this.config.options.models) {
      try {
        const result = await this.runModel(modelName, signal);
        modelResults.push(result);
      } catch (error) {
        this.log('warn', `Model ${modelName} failed`, error);
      }
    }
    
    // Aggregate model results
    const aggregated = this.aggregateModelResults(modelResults);
    
    // Generate prediction
    const prediction = this.generatePrediction(signal, aggregated);
    
    return prediction;
  }

  /**
   * Run a specific analysis model
   */
  private async runModel(modelName: string, signal: Signal): Promise<ModelResult> {
    switch (modelName) {
      case 'momentum':
        return this.runMomentumModel(signal);
      case 'mean_reversion':
        return this.runMeanReversionModel(signal);
      case 'breakout':
        return this.runBreakoutModel(signal);
      case 'trend_following':
        return this.runTrendFollowingModel(signal);
      case 'ml_classifier':
        return this.runMLClassifier(signal);
      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
  }

  /**
   * Momentum analysis model
   */
  private async runMomentumModel(signal: Signal): Promise<ModelResult> {
    // Implementation: Calculate momentum indicators (RSI, MACD, etc.)
    const data = signal.data as Record<string, unknown>;
    const priceChange = (data.priceChange as number) || 0;
    
    const momentum = priceChange > 0 ? 'bullish' : 'bearish';
    const strength = Math.min(Math.abs(priceChange) / 10, 1);
    const confidence = strength * 0.7;
    
    return {
      model: 'momentum',
      signal: momentum,
      confidence,
      strength,
    };
  }

  /**
   * Mean reversion analysis model
   */
  private async runMeanReversionModel(signal: Signal): Promise<ModelResult> {
    // Implementation: Calculate deviation from moving averages
    const data = signal.data as Record<string, unknown>;
    const currentPrice = (data.price as number) || 0;
    const ma20 = (data.ma20 as number) || currentPrice;
    
    const deviation = ((currentPrice - ma20) / ma20) * 100;
    const signal_type = deviation < -5 ? 'bullish' : deviation > 5 ? 'bearish' : 'neutral';
    const confidence = Math.min(Math.abs(deviation) / 10, 0.8);
    
    return {
      model: 'mean_reversion',
      signal: signal_type,
      confidence,
      strength: Math.abs(deviation) / 10,
    };
  }

  /**
   * Breakout analysis model
   */
  private async runBreakoutModel(signal: Signal): Promise<ModelResult> {
    // Implementation: Detect price breakouts from consolidation
    const data = signal.data as Record<string, unknown>;
    const volume = (data.volume as number) || 0;
    const avgVolume = (data.avgVolume as number) || volume;
    
    const volumeRatio = volume / avgVolume;
    const isBreakout = volumeRatio > 2;
    const signal_type = isBreakout ? 'bullish' : 'neutral';
    const confidence = isBreakout ? Math.min(volumeRatio / 5, 0.9) : 0.3;
    
    return {
      model: 'breakout',
      signal: signal_type,
      confidence,
      strength: volumeRatio / 5,
    };
  }

  /**
   * Trend following analysis model
   */
  private async runTrendFollowingModel(signal: Signal): Promise<ModelResult> {
    // Implementation: Identify and follow established trends
    const data = signal.data as Record<string, unknown>;
    const trend = (data.trend as string) || 'neutral';
    const trendStrength = (data.trendStrength as number) || 0;
    
    return {
      model: 'trend_following',
      signal: trend,
      confidence: trendStrength,
      strength: trendStrength,
    };
  }

  /**
   * Machine learning classifier model
   */
  private async runMLClassifier(signal: Signal): Promise<ModelResult> {
    // Implementation: Use OpenClaw ML models for prediction
    const mlResult = await this.openClaw.runMLModel('trading-classifier', signal.data);
    
    return {
      model: 'ml_classifier',
      signal: mlResult.prediction as 'bullish' | 'bearish' | 'neutral',
      confidence: mlResult.confidence,
      strength: mlResult.confidence,
    };
  }

  /**
   * Aggregate results from multiple models
   */
  private aggregateModelResults(results: ModelResult[]): AggregatedResult {
    if (results.length === 0) {
      return {
        signal: 'neutral',
        confidence: 0,
        strength: 0,
      };
    }
    
    // Weight signals by confidence
    const bullishWeight = results
      .filter(r => r.signal === 'bullish')
      .reduce((sum, r) => sum + r.confidence, 0);
    
    const bearishWeight = results
      .filter(r => r.signal === 'bearish')
      .reduce((sum, r) => sum + r.confidence, 0);
    
    const totalWeight = bullishWeight + bearishWeight;
    
    const signal: 'bullish' | 'bearish' | 'neutral' =
      bullishWeight > bearishWeight ? 'bullish' :
      bearishWeight > bullishWeight ? 'bearish' :
      'neutral';
    
    const confidence = totalWeight / results.length;
    const strength = Math.abs(bullishWeight - bearishWeight) / totalWeight;
    
    return { signal, confidence, strength };
  }

  /**
   * Generate a trading prediction from aggregated analysis
   */
  private generatePrediction(signal: Signal, aggregated: AggregatedResult): Prediction {
    const data = signal.data as Record<string, unknown>;
    const pair = (data.pair as string) || 'UNKNOWN';
    
    const action = aggregated.signal === 'bullish' ? 'BUY' :
                   aggregated.signal === 'bearish' ? 'SELL' : 'HOLD';
    
    return {
      id: `pred-${signal.id}`,
      signalId: signal.id,
      pair,
      action,
      confidence: aggregated.confidence,
      strength: aggregated.strength,
      timestamp: Date.now(),
      analyst: this.id,
      models: this.config.options.models,
      riskTolerance: this.config.options.riskTolerance,
    };
  }

  /**
   * Calculate average confidence of all predictions
   */
  private calculateAverageConfidence(): number {
    if (this.predictions.length === 0) return 0;
    
    const sum = this.predictions.reduce((acc, p) => acc + p.confidence, 0);
    return sum / this.predictions.length;
  }
}

/**
 * Model analysis result
 */
export interface ModelResult {
  /** Model name */
  model: string;
  /** Signal direction */
  signal: 'bullish' | 'bearish' | 'neutral';
  /** Confidence level (0-1) */
  confidence: number;
  /** Signal strength (0-1) */
  strength: number;
}

/**
 * Aggregated model results
 */
export interface AggregatedResult {
  /** Overall signal */
  signal: 'bullish' | 'bearish' | 'neutral';
  /** Combined confidence */
  confidence: number;
  /** Combined strength */
  strength: number;
}

/**
 * Trading prediction
 */
export interface Prediction {
  /** Unique prediction ID */
  id: string;
  /** Source signal ID */
  signalId: string;
  /** Trading pair */
  pair: string;
  /** Recommended action */
  action: 'BUY' | 'SELL' | 'HOLD';
  /** Confidence level (0-1) */
  confidence: number;
  /** Signal strength (0-1) */
  strength: number;
  /** Prediction timestamp */
  timestamp: number;
  /** Analyst agent ID */
  analyst: string;
  /** Models used */
  models: string[];
  /** Risk tolerance */
  riskTolerance: 'low' | 'medium' | 'high';
}

/**
 * Analyst agent statistics
 */
export interface AnalystStats extends AgentStats {
  /** Total signals analyzed */
  signalsAnalyzed: number;
  /** Average prediction confidence */
  avgConfidence: number;
  /** Configured models */
  models: string[];
}
