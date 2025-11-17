import { z } from 'zod'

export const tenantCreateSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.enum(['admin', 'group', 'company']),
  parentTenantId: z.string().uuid().nullable().optional()
})
