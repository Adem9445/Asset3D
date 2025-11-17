import { tenantRepository } from './tenant.repository.js'
import { tenantCreateSchema } from './tenant.validator.js'

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
    return tenantRepository.createTenant(validatedData)
  }
}
