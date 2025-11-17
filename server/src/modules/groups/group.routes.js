import express from 'express'
import { groupController } from './group.controller.js'
import { asyncHandler } from '../common/utils/asyncHandler.js'
import { csrfGuard } from '../security/middleware/csrfGuard.js'
import { requireRole, requireTenantAccess } from '../security/middleware/rbac.js'
import { tenantContext } from '../security/middleware/tenantContext.js'

const router = express.Router()

router.use(tenantContext)

router.get('/', requireRole('admin', 'group'), asyncHandler(groupController.list))
router.get(
  '/:id',
  requireRole('admin', 'group'),
  requireTenantAccess('id'),
  asyncHandler(groupController.getById)
)
router.get(
  '/:id/stats',
  requireRole('admin', 'group'),
  requireTenantAccess('id'),
  asyncHandler(groupController.stats)
)

router.post('/', requireRole('admin'), csrfGuard, asyncHandler(groupController.create))
router.put(
  '/:id',
  requireRole('admin', 'group'),
  requireTenantAccess('id'),
  csrfGuard,
  asyncHandler(groupController.update)
)
router.delete(
  '/:id',
  requireRole('admin'),
  requireTenantAccess('id'),
  csrfGuard,
  asyncHandler(groupController.remove)
)

router.post(
  '/:groupId/companies',
  requireRole('admin', 'group'),
  requireTenantAccess('groupId'),
  csrfGuard,
  asyncHandler(groupController.addCompany)
)
router.delete(
  '/:groupId/companies/:companyId',
  requireRole('admin', 'group'),
  requireTenantAccess('groupId'),
  csrfGuard,
  asyncHandler(groupController.removeCompany)
)
router.post(
  '/:groupId/invitations',
  requireRole('admin', 'group'),
  requireTenantAccess('groupId'),
  csrfGuard,
  asyncHandler(groupController.invite)
)

export default router
