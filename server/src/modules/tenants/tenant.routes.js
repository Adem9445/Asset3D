import express from 'express'
import { tenantController } from './tenant.controller.js'
import { asyncHandler } from '../common/utils/asyncHandler.js'
import { requireRole, requireTenantAccess } from '../security/middleware/rbac.js'
import { csrfGuard } from '../security/middleware/csrfGuard.js'
import { tenantContext } from '../security/middleware/tenantContext.js'

const router = express.Router()

router.use(tenantContext)

router.get('/', requireRole('admin', 'group'), asyncHandler(tenantController.list))
router.get(
  '/:id',
  requireRole('admin', 'group', 'company'),
  requireTenantAccess('id'),
  asyncHandler(tenantController.getById)
)
router.post('/', requireRole('admin', 'group'), csrfGuard, asyncHandler(tenantController.create))

export default router
