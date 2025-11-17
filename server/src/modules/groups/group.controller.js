import { groupService } from './group.service.js'

export const groupController = {
  list: async (req, res) => {
    const groups = await groupService.listGroups()
    res.json({ groups })
  },

  getById: async (req, res) => {
    const group = await groupService.getGroupDetails(req.params.id)
    res.json(group)
  },

  create: async (req, res) => {
    const group = await groupService.createGroup(req.body)
    res.status(201).json(group)
  },

  update: async (req, res) => {
    const group = await groupService.updateGroup(req.params.id, req.body)
    res.json(group)
  },

  remove: async (req, res) => {
    await groupService.deleteGroup(req.params.id)
    res.json({ message: 'Gruppe slettet' })
  },

  addCompany: async (req, res) => {
    const result = await groupService.addCompany(req.params.groupId, req.body.companyId)
    res.json({ message: 'Selskap lagt til gruppe', ...result })
  },

  removeCompany: async (req, res) => {
    const result = await groupService.removeCompany(req.params.groupId, req.params.companyId)
    res.json({ message: 'Selskap fjernet fra gruppe', ...result })
  },

  stats: async (req, res) => {
    const stats = await groupService.getGroupStats(req.params.id)
    res.json(stats)
  },

  invite: async (req, res) => {
    const invitation = await groupService.createInvitation(req.params.groupId, req.body)
    res.status(201).json({ message: 'Invitasjon sendt', invitation })
  }
}
