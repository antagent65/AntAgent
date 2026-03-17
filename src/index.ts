/**
 * ANT AGENT - Main Entry Point
 * 
 * Autonomous AI Trading Colony powered by OpenClaw
 */

import { AntAgent } from './agents/AntAgent.js';
import { config } from './config/default.js';
import { logger, initializeLogger } from './utils/logger.js';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  // Initialize logger
  initializeLogger({
    level: config.logging.level,
    console: config.logging.console,
    file: config.logging.file,
  });

  logger.info('🐜 Starting ANT AGENT...');
  logger.info({ version: '1.0.0' }, 'ANT AGENT - Autonomous AI Trading Colony');

  try {
    // Create colony instance
    const colony = new AntAgent(config);

    // Initialize colony
    logger.info('Initializing colony...');
    await colony.initialize();

    // Deploy scout agents
    logger.info('Deploying scout agents...');
    await colony.deployScout({
      targets: ['new_pools', 'whale_alerts', 'price_movement', 'volume_spike'],
      updateInterval: 1000,
      signalThreshold: 0.7,
    });

    // Deploy analyst agents
    logger.info('Deploying analyst agents...');
    await colony.deployAnalyst({
      models: ['momentum', 'mean_reversion', 'breakout', 'ml_classifier'],
      confidenceThreshold: 0.75,
      riskTolerance: 'medium',
    });

    // Deploy executor agents
    logger.info('Deploying executor agents...');
    await colony.deployExecutor({
      maxSlippage: 2.0,
      priorityFee: 'high',
      splitOrders: true,
      wallets: [process.env.WALLET_ADDRESS || ''],
    });

    // Deploy learning agent if enabled
    if (config.agents.learningEnabled) {
      logger.info('Deploying learning agent...');
      await colony.deployLearning({
        learningRate: 0.01,
        evaluationWindow: '24h',
        adaptationSpeed: 'moderate',
      });
    }

    // Start the colony
    logger.info('Starting colony...');
    await colony.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await colony.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await colony.stop();
      process.exit(0);
    });

    // Log colony status periodically
    setInterval(() => {
      const status = colony.getStatus();
      const metrics = colony.getMetrics();
      
      logger.info(
        {
          activeAgents: status.activeAgents,
          totalTrades: status.totalTrades,
          totalPnl: metrics.totalPnl,
          winRate: metrics.winRate,
        },
        '🐜 Colony Status'
      );
    }, 60000); // Every minute

    logger.info('✅ ANT AGENT is running!');
  } catch (error) {
    logger.error('Failed to start ANT AGENT', error);
    process.exit(1);
  }
}

// Run the application
main().catch((error) => {
  logger.error('Unhandled error', error);
  process.exit(1);
});
