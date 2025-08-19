import pino from 'pino'
import { env, isDevelopment } from '../../config/env'

export const loggerConfig = {
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() }
    }
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`
}

export const logger = pino(loggerConfig)
