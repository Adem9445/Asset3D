/**
 * Test script for ASSET3D system
 * Kjør dette for å verifisere at alt fungerer
 */

const axios = require('axios')

const API_URL = 'http://localhost:5001/api'
let authToken = null

// Farger for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
}

// Test funksjoner
const tests = {
  // Test 1: Server health check
  async serverHealth() {
    try {
      const response = await axios.get(`${API_URL}/health`).catch(() => null)
      if (response) {
        log.success('Server health check')
        return true
      } else {
        // Prøv root endpoint
        const rootResponse = await axios.get('http://localhost:5001/')
        log.success('Server kjører på port 5001')
        return true
      }
    } catch (error) {
      log.error('Server ikke tilgjengelig på port 5001')
      return false
    }
  },

  // Test 2: Login
  async login() {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@asset3d.no',
        password: 'demo123'
      })

      if (response.data.token) {
        authToken = response.data.token
        log.success(`Innlogging vellykket - Token mottatt`)
        log.info(`Bruker: ${response.data.user.name} (${response.data.user.role})`)
        return true
      }
    } catch (error) {
      log.error(`Login feilet: ${error.response?.data?.message || error.message}`)
      return false
    }
  },

  // Test 3: Get current user
  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      if (response.data.user) {
        log.success('Hentet current user')
        log.info(`User ID: ${response.data.user.id}`)
        return true
      }
    } catch (error) {
      log.error(`Kunne ikke hente bruker: ${error.response?.data?.message || error.message}`)
      return false
    }
  },

  // Test 4: Get tenants (admin only)
  async getTenants() {
    try {
      const response = await axios.get(`${API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      log.success(`Hentet ${response.data.length || 0} tenants`)
      return true
    } catch (error) {
      if (error.response?.status === 403) {
        log.warning('Ingen tilgang til tenants (krever admin rolle)')
      } else {
        log.error(`Tenant fetch feilet: ${error.response?.data?.message || error.message}`)
      }
      return false
    }
  },

  // Test 5: Get locations
  async getLocations() {
    try {
      const response = await axios.get(`${API_URL}/locations`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      log.success(`Hentet ${response.data.length || 0} lokasjoner`)
      return true
    } catch (error) {
      log.error(`Location fetch feilet: ${error.response?.data?.message || error.message}`)
      return false
    }
  },

  // Test 6: Get assets
  async getAssets() {
    try {
      const response = await axios.get(`${API_URL}/assets`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      log.success(`Hentet ${response.data.length || 0} assets`)
      return true
    } catch (error) {
      log.error(`Asset fetch feilet: ${error.response?.data?.message || error.message}`)
      return false
    }
  },

  // Test 7: Client app check
  async clientApp() {
    try {
      const response = await axios.get('http://localhost:3000')
      if (response.status === 200) {
        log.success('Client app kjører på port 3000')
        return true
      }
    } catch (error) {
      log.error('Client app ikke tilgjengelig på port 3000')
      return false
    }
  },

  // Test 8: Database connection
  async databaseCheck() {
    try {
      const response = await axios.get(`${API_URL}/assets/categories`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      if (response.data && response.data.length > 0) {
        log.success(`Database tilkobling OK - ${response.data.length} kategorier funnet`)
        return true
      } else {
        log.warning('Database tilkobling OK, men ingen kategorier funnet')
        return true
      }
    } catch (error) {
      log.error(`Database check feilet: ${error.response?.data?.message || error.message}`)
      return false
    }
  }
}

// Kjør alle tester
async function runAllTests() {
  console.log('\n' + colors.blue + '════════════════════════════════════════')
  console.log('   ASSET3D System Test Suite')
  console.log('════════════════════════════════════════' + colors.reset + '\n')

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  }

  // Test rekkefølge
  const testOrder = [
    'serverHealth',
    'clientApp',
    'login',
    'getCurrentUser',
    'databaseCheck',
    'getTenants',
    'getLocations',
    'getAssets'
  ]

  for (const testName of testOrder) {
    console.log(`\nTest ${results.total + 1}: ${testName}`)
    console.log('-------------------')

    const testFn = tests[testName]
    if (testFn) {
      const success = await testFn()
      results.total++

      if (success) {
        results.passed++
      } else {
        results.failed++
      }

      // Vent litt mellom tester
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Oppsummering
  console.log('\n' + colors.blue + '════════════════════════════════════════')
  console.log('   Test Resultater')
  console.log('════════════════════════════════════════' + colors.reset)

  console.log(`\nTotalt: ${results.total} tester`)
  console.log(`${colors.green}Bestått: ${results.passed}${colors.reset}`)
  console.log(`${colors.red}Feilet: ${results.failed}${colors.reset}`)

  const successRate = (results.passed / results.total * 100).toFixed(1)

  if (results.failed === 0) {
    console.log(`\n${colors.green}✨ Alle tester bestått! (${successRate}%) ✨${colors.reset}`)
  } else if (results.passed > results.failed) {
    console.log(`\n${colors.yellow}⚠ Delvis suksess (${successRate}%)${colors.reset}`)
  } else {
    console.log(`\n${colors.red}❌ Flere tester feilet (${successRate}%)${colors.reset}`)
  }

  console.log('\n' + colors.blue + '════════════════════════════════════════' + colors.reset + '\n')

  // Tips for feilsøking
  if (results.failed > 0) {
    console.log(colors.yellow + 'Tips for feilsøking:' + colors.reset)
    console.log('1. Sjekk at både server og client kjører (npm run dev)')
    console.log('2. Sjekk at PostgreSQL kjører hvis du bruker database')
    console.log('3. Sjekk at demo-brukere er opprettet (curl -X POST http://localhost:5001/api/auth/init-demo)')
    console.log('4. Se server-loggen for mer detaljerte feilmeldinger\n')
  } else {
    console.log(colors.green + '🎉 Systemet er klart til bruk!' + colors.reset)
    console.log('\nGå til http://localhost:3000 og logg inn med:')
    console.log('Email: admin@asset3d.no')
    console.log('Passord: demo123\n')
  }
}

// Start testing
runAllTests().catch(console.error)
