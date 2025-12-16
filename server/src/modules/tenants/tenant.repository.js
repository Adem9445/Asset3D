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
      let tenants = []

      if (user.role === 'admin') {
        tenants = mockDB.tenants
      } else if (user.role === 'group') {
        tenants = mockDB.tenants
          .filter((tenant) => tenant.id === user.tenantId || tenant.parent_tenant_id === user.tenantId)
      } else {
        tenants = mockDB.tenants.filter((tenant) => tenant.id === user.tenantId)
      }

      // Add user count to each tenant
      return tenants.map(tenant => ({
        ...normalizeTenant(tenant),
        userCount: mockDB.users.filter(u => u.tenant_id === tenant.id).length
      }))
    }

    const baseQuery = `
      SELECT 
        t.id, 
        t.name, 
        t.type, 
        t.parent_tenant_id AS "parentTenantId", 
        t.settings, 
        t.created_at AS created, 
        t.updated_at,
        COUNT(u.id) AS "userCount"
      FROM tenants t
      LEFT JOIN users u ON t.id = u.tenant_id
    `

    if (user.role === 'admin') {
      const { rows } = await query(`
        ${baseQuery}
        GROUP BY t.id, t.name, t.type, t.parent_tenant_id, t.settings, t.created_at, t.updated_at
        ORDER BY t.created_at DESC
      `)
      return rows.map(row => ({
        ...row,
        userCount: parseInt(row.userCount) || 0
      }))
    }

    if (user.role === 'group') {
      const { rows } = await query(`
        ${baseQuery}
        WHERE t.id = $1 OR t.parent_tenant_id = $1
        GROUP BY t.id, t.name, t.type, t.parent_tenant_id, t.settings, t.created_at, t.updated_at
        ORDER BY t.created_at DESC
      `, [user.tenantId])
      return rows.map(row => ({
        ...row,
        userCount: parseInt(row.userCount) || 0
      }))
    }

    const { rows } = await query(`
      ${baseQuery}
      WHERE t.id = $1
      GROUP BY t.id, t.name, t.type, t.parent_tenant_id, t.settings, t.created_at, t.updated_at
      ORDER BY t.created_at DESC
    `, [user.tenantId])
    return rows.map(row => ({
      ...row,
      userCount: parseInt(row.userCount) || 0
    }))
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
