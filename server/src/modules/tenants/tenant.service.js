import { tenantRepository } from './tenant.repository.js'
import { tenantCreateSchema } from './tenant.validator.js'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

export const tenantService = {
  async listTenants(user) {
    return tenantRepository.findAllForUser(user)
  },

  async getTenantById(id) {
    const tenant = await tenantRepository.findById(id)
    if (!tenant) {
      const error = new Error('Organisasjon ikke funnet')
      error.statusCode = 404
      throw error
    }

    return tenant
  },

  async createTenant(payload) {
    const validatedData = tenantCreateSchema.parse(payload)

    // Create the tenant
    const tenant = await tenantRepository.createTenant(validatedData)

    // Generate a random secure password for the company admin
    const tempPassword = crypto.randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create a company admin user for this tenant
    const adminEmail = payload.adminEmail || `admin@${validatedData.name.toLowerCase().replace(/\s+/g, '')}.no`

    // Create user in database or mockDB
    const adminUser = await this.createCompanyAdmin({
      email: adminEmail,
      name: payload.adminName || 'Company Admin',
      tenant_id: tenant.id,
      password: hashedPassword,
      role: 'company',
      is_active: true
    })

    // Return tenant with admin credentials (password should be sent securely to admin)
    return {
      tenant,
      admin: {
        id: adminUser.id,
        email: adminEmail,
        tempPassword: tempPassword, // This should be sent securely and user should change it
        name: adminUser.name
      }
    }
  },

  async createCompanyAdmin(userData) {
    if (process.env.USE_MOCK_DB === 'true') {
      const mockDB = (await import('../../db/mockData.js')).default
      const newUser = {
        id: crypto.randomUUID(),
        ...userData,
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockDB.users.push(newUser)
      return newUser
    }

    // For real database
    const { query } = await import('../../db/init.js')
    const { rows } = await query(
      `INSERT INTO users (email, name, password, role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, tenant_id, is_active, created_at`,
      [userData.email, userData.name, userData.password, userData.role, userData.tenant_id, userData.is_active]
    )

    return rows[0]
  }
}
