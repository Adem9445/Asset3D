import { query } from '../../db/init.js'

export const groupRepository = {
  async findGroupById(groupId) {
    if (!groupId) {
      return null
    }

    const { rows } = await query(
      `SELECT id, name, type, parent_tenant_id
       FROM tenants
       WHERE id = $1 AND type = 'group'`,
      [groupId]
    )

    return rows[0] || null
  },

  async findCompanyById(companyId) {
    if (!companyId) {
      return null
    }

    const { rows } = await query(
      `SELECT id, name, type, parent_tenant_id
       FROM tenants
       WHERE id = $1 AND type = 'company'`,
      [companyId]
    )

    return rows[0] || null
  },

  async linkCompanyToGroup(groupId, companyId) {
    const { rows } = await query(
      `UPDATE tenants
         SET parent_tenant_id = $1,
             updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND type = 'company'
       RETURNING id, name, parent_tenant_id`,
      [groupId, companyId]
    )

    return rows[0] || null
  },

  async unlinkCompanyFromGroup(companyId) {
    const { rows } = await query(
      `UPDATE tenants
         SET parent_tenant_id = NULL,
             updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND type = 'company'
       RETURNING id, name, parent_tenant_id`,
      [companyId]
    )

    return rows[0] || null
  }
}
