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

export const groupRepository = {
  async listGroups() {
    if (useMock()) {
      const mockDB = await getMockDb()
      return mockDB.tenants.filter((tenant) => tenant.type === 'group').map(normalizeTenant)
    }

    const { rows } = await query(
      `SELECT id, name, type, settings, created_at, updated_at FROM tenants WHERE type = 'group' ORDER BY created_at DESC`
    )

    return rows
  },

  async getGroupWithCompanies(groupId) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const group = mockDB.tenants.find((tenant) => tenant.id === groupId && tenant.type === 'group')
      if (!group) return null

      const companies = mockDB.tenants.filter((tenant) => tenant.parent_tenant_id === groupId)
      return { ...normalizeTenant(group), companies: companies.map(normalizeTenant) }
    }

    const { rows: groupRows } = await query(
      `SELECT id, name, description, type, settings, created_at, updated_at FROM tenants WHERE id = $1 AND type = 'group'`,
      [groupId]
    )

    if (groupRows.length === 0) {
      return null
    }

    const { rows: companies } = await query(
      `SELECT id, name, type, created_at FROM tenants WHERE parent_tenant_id = $1 ORDER BY created_at DESC`,
      [groupId]
    )

    return { ...groupRows[0], companies }
  },

  async createGroup(payload) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const newGroup = {
        id: crypto.randomUUID(),
        type: 'group',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...payload
      }
      mockDB.tenants.push(newGroup)
      return normalizeTenant(newGroup)
    }

    const { rows } = await query(
      `INSERT INTO tenants (name, type, settings)
       VALUES ($1, 'group', $2)
       RETURNING id, name, type, settings, created_at, updated_at`,
      [payload.name, JSON.stringify(payload)]
    )

    return rows[0]
  },

  async updateGroup(groupId, updates) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const index = mockDB.tenants.findIndex((tenant) => tenant.id === groupId)
      if (index === -1) {
        return null
      }
      mockDB.tenants[index] = {
        ...mockDB.tenants[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      return normalizeTenant(mockDB.tenants[index])
    }

    const { rows } = await query(
      `UPDATE tenants SET name = COALESCE($1, name), settings = settings || $2::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND type = 'group'
       RETURNING id, name, type, settings, updated_at`,
      [updates.name ?? null, JSON.stringify(updates), groupId]
    )

    return rows[0] || null
  },

  async deleteGroup(groupId) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const hasCompanies = mockDB.tenants.some((tenant) => tenant.parent_tenant_id === groupId)
      if (hasCompanies) {
        return { deleted: false, reason: 'active_companies' }
      }
      const initialLength = mockDB.tenants.length
      mockDB.tenants = mockDB.tenants.filter((tenant) => tenant.id !== groupId)
      return { deleted: mockDB.tenants.length < initialLength }
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM tenants WHERE parent_tenant_id = $1`,
      [groupId]
    )

    if (rows[0]?.count > 0) {
      return { deleted: false, reason: 'active_companies' }
    }

    const result = await query(
      'DELETE FROM tenants WHERE id = $1 AND type = $2',
      [groupId, 'group']
    )
    return { deleted: result.rowCount > 0 }
  },

  async listGroupStats(groupId) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const companies = mockDB.tenants.filter((tenant) => tenant.parent_tenant_id === groupId)
      return {
        groupId,
        companies: companies.length,
        totalAssets: mockDB.assets.filter((asset) => companies.some((c) => c.id === asset.tenant_id)).length,
        updatedAt: new Date().toISOString()
      }
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int as companies FROM tenants WHERE parent_tenant_id = $1`,
      [groupId]
    )

    return { groupId, companies: rows[0]?.companies || 0 }
  },

  async linkCompanyToGroup(groupId, companyId) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const company = mockDB.tenants.find((tenant) => tenant.id === companyId)
      if (!company) {
        return null
      }
      company.parent_tenant_id = groupId
      return normalizeTenant(company)
    }

    const { rows } = await query(
      `UPDATE tenants SET parent_tenant_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND type = 'company'
       RETURNING id, name, parent_tenant_id AS "parentTenantId"`,
      [groupId, companyId]
    )

    return rows[0] || null
  },

  async unlinkCompanyFromGroup(companyId) {
    if (useMock()) {
      const mockDB = await getMockDb()
      const company = mockDB.tenants.find((tenant) => tenant.id === companyId)
      if (!company) {
        return null
      }
      company.parent_tenant_id = null
      return normalizeTenant(company)
    }

    const { rows } = await query(
      `UPDATE tenants SET parent_tenant_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND type = 'company'
       RETURNING id, name, parent_tenant_id AS "parentTenantId"`,
      [companyId]
    )

    return rows[0] || null
  }
}
