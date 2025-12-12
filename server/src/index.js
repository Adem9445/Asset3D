import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import tenantRoutes from './modules/tenants/tenant.routes.js'
import locationRoutes from './routes/locations.js'
import assetRoutes from './routes/assets.js'
import userRoutes from './routes/users.js'
import buildingsRoutes from './routes/buildings.js'
import groupsRoutes from './modules/groups/group.routes.js'
import { authenticateToken } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { initDatabase } from './db/init.js'
import { requestSanitizer } from './modules/security/middleware/requestSanitizer.js'
import { tenantContext } from './modules/security/middleware/tenantContext.js'
import { csrfGuard } from './modules/security/middleware/csrfGuard.js'
import { logger, httpLogger } from './utils/logger.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'For mange forespørsler fra denne IP-adressen'
})

// Middleware
app.use(httpLogger)
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestSanitizer)
app.use('/api', limiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/groups', authenticateToken, groupsRoutes)
app.use('/api/tenants', authenticateToken, tenantRoutes)
app.use('/api/locations', authenticateToken, tenantContext, locationRoutes)
app.use('/api/assets', authenticateToken, tenantContext, assetRoutes)
app.use('/api/users', authenticateToken, tenantContext, csrfGuard, userRoutes)
app.use('/api/buildings', authenticateToken, tenantContext, buildingsRoutes)

// Error handling
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    // Try to initialize database
    try {
      await initDatabase()
    } catch (dbError) {
      console.warn('⚠️  Kunne ikke koble til PostgreSQL:', dbError.message)
      console.log('🔄 Starter i DEMO-MODUS uten database...')
      
      // Import and use mock data
      const { initMockData } = await import('./db/mockData.js')
      await initMockData()
      
      // Set flag for routes to use mock data
      process.env.USE_MOCK_DB = 'true'
    }
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server kjører på port ${PORT}`)
      logger.info(`📍 API tilgjengelig på http://localhost:${PORT}/api`)
      if (process.env.USE_MOCK_DB === 'true') {
        logger.warn('⚠️  DEMO-MODUS: Data lagres kun i minnet')
        logger.info('📧 Demo brukere:')
        logger.info('   - admin@asset3d.no / demo123')
        logger.info('   - company@asset3d.no / demo123')
        logger.info('   - user@asset3d.no / demo123')
      }
    })
  } catch (error) {
    logger.error({ err: error }, 'Kunne ikke starte server')
    process.exit(1)
  }
}

startServer()
