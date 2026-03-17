/**
 * Default Configuration for ANT AGENT
 */

import { ColonyConfig } from '../types/index.js';

export const config: ColonyConfig = {
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    wsEndpoint: process.env.SOLANA_WS_URL,
    commitment: (process.env.SOLANA_COMMITMENT as 'processed' | 'confirmed' | 'finalized') || 'confirmed',
  },
  openclaw: {
    apiKey: process.env.OPENCLAW_API_KEY || '',
    colony: process.env.OPENCLAW_COLONY || 'ant-agent-main',
    heartbeatInterval: parseInt(process.env.OPENCLAW_HEARTBEAT_INTERVAL || '30000'),
    enableLearning: process.env.OPENCLAW_ENABLE_LEARNING === 'true',
  },
  trading: {
    maxSlippage: parseFloat(process.env.MAX_SLIPPAGE || '2.5'),
    defaultPriority: (process.env.DEFAULT_PRIORITY as 'low' | 'medium' | 'high') || 'high',
    maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '1000'),
    stopLoss: process.env.STOP_LOSS ? parseFloat(process.env.STOP_LOSS) : undefined,
    takeProfit: process.env.TAKE_PROFIT ? parseFloat(process.env.TAKE_PROFIT) : undefined,
    dailyLossLimit: process.env.DAILY_LOSS_LIMIT ? parseFloat(process.env.DAILY_LOSS_LIMIT) : undefined,
  },
  agents: {
    maxScouts: parseInt(process.env.MAX_SCOUTS || '5'),
    maxAnalysts: parseInt(process.env.MAX_ANALYSTS || '5'),
    maxExecutors: parseInt(process.env.MAX_EXECUTORS || '3'),
    learningEnabled: process.env.LEARNING_ENABLED === 'true',
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    file: process.env.LOG_FILE,
    console: process.env.LOG_CONSOLE !== 'false',
  },
};

export default config;
