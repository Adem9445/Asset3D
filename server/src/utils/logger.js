import pino from 'pino'
import pinoHttp from 'pino-http'
import { randomUUID } from 'node:crypto'
import 'dotenv/config' // Ensure env vars are loaded before logger config

// Configure the base logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    }
  } : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
})

// Configure the HTTP middleware
const httpLogger = pinoHttp({
  logger,
  // Define a custom request id generator
  genReqId: (req, res) => {
    // Check for existing ID (e.g. from load balancer)
    if (req.id) return req.id
    if (req.headers['x-request-id']) return req.headers['x-request-id']
    // Fallback to UUID
    return randomUUID()
  },
  // Custom serializers or attribute keys can be added here
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent'
    }
    return 'info'
  },
})

export { logger, httpLogger }
