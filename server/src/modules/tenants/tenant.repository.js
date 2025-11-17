import crypto from 'crypto'
import { query } from '../../db/init.js'

const useMock = () => process.env.USE_MOCK_DB === 'true'

const getMockDb = async () => {
  const module = await import('../../db/mockData.js')
  return module.default
}

const normalizeTenant = (tenant) => {
  if (!tenant) {
    return null
  }

  const { parent_tenant_id, ...rest } = tenant
  return {
    ...rest,
    parentTenantId: tenant.parentTenantId || parent_tenant_id || null
  }
}

export const tenantRepository = {
  async findAllForUser(user) {
    if (useMock()) {
      const mockDB = await getMockDb()
      if (user.role === 'admin') {
        return mockDB.tenants.map(normalizeTenant)
      }

      if (user.role === 'group') {
        return mockDB.tenants
          .filter((tenant) => tenant.id === user.tenantId || tenant.parent_tenant_id === user.tenantId)
          .map(normalizeTenant)
      }

      return mockDB.tenants.filter((tenant) => tenant.id === user.tenantId).map(normalizeTenant)
    }

    const baseQuery = `
      SELECT id, name, type, parent_tenant_id AS "parentTenantId", settings, created_at, updated_at
      FROM tenants
    `

    if (user.role === 'admin') {
      const { rows } = await query(`${baseQuery} ORDER BY created_at DESC`)
      return rows
    }

    if (user.role === 'group') {
      const { rows } = await query(
        `${baseQuery} WHERE id = $1 OR parent_tenant_id = $1 ORDER BY created_at DESC`,
        [user.tenantId]
      )
      return rows
    }

    const { rows } = await query(
      `${baseQuery} WHERE id = $1 ORDER BY created_at DESC`,
      [user.tenantId]
    )
    return rows
  },

  async findById(id) {
    if (useMock()) {
      const mockDB = await getMockDb()
      return normalizeTenant(mockDB.tenants.find((tenant) => tenant.id === id))
    }

    const { rows } = await query(
      `SELECT id, name, type, parent_tenant_id AS "parentTenantId", settings FROM tenants WHERE id = $1`,
      [id]
    )

    return rows[0] || null
  },

  async createTenant({ name, type, parentTenantId }) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const newTenant = {
        id: crypto.randomUUID(),
        name,
        type,
        parent_tenant_id: parentTenantId || null,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockDB.tenants.push(newTenant)
      return normalizeTenant(newTenant)
    }

    const { rows } = await query(
      `INSERT INTO tenants (name, type, parent_tenant_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, type, parent_tenant_id AS "parentTenantId", settings, created_at, updated_at`,
      [name, type, parentTenantId || null]
    )

    return rows[0]
  }
}
