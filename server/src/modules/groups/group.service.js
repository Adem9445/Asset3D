import { groupRepository } from './group.repository.js'

const ensureGroupExists = async groupId => {
  const group = await groupRepository.findGroupById(groupId)

  if (!group) {
    const error = new Error('Gruppe ikke funnet')
    error.statusCode = 404
    throw error
  }

  return group
}

const ensureActorOwnsGroup = (groupId, actorTenantId) => {
  if (actorTenantId && actorTenantId !== groupId) {
    const error = new Error('Du har ikke tilgang til denne gruppen')
    error.statusCode = 403
    throw error
  }
}

const ensureCompanyBelongsToGroup = (company, groupId) => {
  if (!company) {
    const error = new Error('Selskap ikke funnet')
    error.statusCode = 404
    throw error
  }

  if (company.parent_tenant_id !== groupId) {
    const error = new Error('Selskapet tilhører ikke denne gruppen')
    error.statusCode = 403
    throw error
  }
}

export const groupService = {
  async addCompany(groupId, companyId, actorTenantId = null) {
    if (!companyId) {
      const error = new Error('companyId er påkrevd')
      error.statusCode = 400
      throw error
    }

    const group = await ensureGroupExists(groupId)
    ensureActorOwnsGroup(group.id, actorTenantId)

    const company = await groupRepository.findCompanyById(companyId)
    ensureCompanyBelongsToGroup(company, group.id)

    const result = await groupRepository.linkCompanyToGroup(groupId, companyId)

    if (!result) {
      const error = new Error('Kunne ikke oppdatere selskapet')
      error.statusCode = 500
      throw error
    }

    return { groupId, company: result }
  },

  async removeCompany(groupId, companyId, actorTenantId = null) {
    if (!companyId) {
      const error = new Error('companyId er påkrevd')
      error.statusCode = 400
      throw error
    }

    const group = await ensureGroupExists(groupId)
    ensureActorOwnsGroup(group.id, actorTenantId)

    const company = await groupRepository.findCompanyById(companyId)
    ensureCompanyBelongsToGroup(company, group.id)

    const result = await groupRepository.unlinkCompanyFromGroup(companyId)

    if (!result) {
      const error = new Error('Kunne ikke oppdatere selskapet')
      error.statusCode = 500
      throw error
    }

    return { groupId, company: result }
  }
}
