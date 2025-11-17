import crypto from 'crypto'
import { groupRepository } from './group.repository.js'
import { groupCreateSchema, groupInvitationSchema, groupUpdateSchema } from './group.validator.js'

export const groupService = {
  async listGroups() {
    return groupRepository.listGroups()
  },

  async getGroupDetails(groupId) {
    const group = await groupRepository.getGroupWithCompanies(groupId)
    if (!group) {
      const error = new Error('Gruppe ikke funnet')
      error.statusCode = 404
      throw error
    }
    return group
  },

  async createGroup(payload) {
    const data = groupCreateSchema.parse(payload)
    return groupRepository.createGroup(data)
  },

  async updateGroup(groupId, payload) {
    const data = groupUpdateSchema.parse(payload)
    const updated = await groupRepository.updateGroup(groupId, data)
    if (!updated) {
      const error = new Error('Gruppe ikke funnet')
      error.statusCode = 404
      throw error
    }
    return updated
  },

  async deleteGroup(groupId) {
    const result = await groupRepository.deleteGroup(groupId)
    if (!result.deleted) {
      if (result.reason === 'active_companies') {
        const error = new Error('Kan ikke slette gruppe med aktive selskaper')
        error.statusCode = 400
        throw error
      }

      const error = new Error('Gruppe ikke funnet')
      error.statusCode = 404
      throw error
    }
  },

  async addCompany(groupId, companyId) {
    if (!companyId) {
      const error = new Error('companyId er påkrevd')
      error.statusCode = 400
      throw error
    }

    const result = await groupRepository.linkCompanyToGroup(groupId, companyId)

    if (!result) {
      const error = new Error('Selskap ikke funnet')
      error.statusCode = 404
      throw error
    }

    return { groupId, company: result }
  },

  async removeCompany(groupId, companyId) {
    const result = await groupRepository.unlinkCompanyFromGroup(companyId)
    if (!result) {
      const error = new Error('Selskap ikke funnet')
      error.statusCode = 404
      throw error
    }

    return { groupId, company: result }
  },

  async getGroupStats(groupId) {
    return groupRepository.listGroupStats(groupId)
  },

  async createInvitation(groupId, payload) {
    const data = groupInvitationSchema.parse(payload)
    return {
      groupId,
      ...data,
      id: crypto.randomUUID(),
      status: 'pending',
      created_at: new Date().toISOString()
    }
  }
}
