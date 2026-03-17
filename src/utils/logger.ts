import pino, { Logger, LoggerOptions } from 'pino';

/**
 * Logger instance
 */
let logger: Logger;

/**
 * Logger configuration
 */
interface LoggerConfig {
  /** Log level */
  level: string;
  /** Enable console output */
  console: boolean;
  /** Log file path */
  file?: string;
}

/**
 * Initialize the logger
 */
export function initializeLogger(config: LoggerConfig): void {
  const options: LoggerOptions = {
    level: config.level,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (config.console) {
    options.transport = {
      targets: [
        {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      ],
    };
  }

  logger = pino(options);
}

/**
 * Get the logger instance
 */
export function getLogger(): Logger {
  if (!logger) {
    // Initialize with defaults if not already initialized
    initializeLogger({
      level: process.env.LOG_LEVEL || 'info',
      console: true,
    });
  }
  return logger;
}

/**
 * Default logger export
 */
export const logger = getLogger();
