import { tenantService } from './tenant.service.js'

export const tenantController = {
  list: async (req, res) => {
    const tenants = await tenantService.listTenants(req.user)
    res.json({ tenants, tenantContext: req.tenantContext })
  },

  getById: async (req, res) => {
    const tenant = await tenantService.getTenantById(req.params.id)
    res.json(tenant)
  },

  create: async (req, res) => {
    const tenant = await tenantService.createTenant(req.body)
    res.status(201).json(tenant)
  }
}
