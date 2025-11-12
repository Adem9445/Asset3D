import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback configuration if DATABASE_URL is not set
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'asset3d',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test the connection
pool.on('connect', () => {
  console.log('✅ Database pool connection established')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err)
})

export default pool
