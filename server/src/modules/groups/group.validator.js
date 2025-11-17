import { z } from 'zod'

export const groupCreateSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(500).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().min(5).max(50).optional(),
  address: z.string().max(255).optional(),
  website: z.string().url().optional()
})

export const groupUpdateSchema = groupCreateSchema.partial()

export const groupInvitationSchema = z.object({
  company_email: z.string().email(),
  company_name: z.string().min(2).max(255),
  message: z.string().max(1000).optional(),
  expires_in_days: z.number().min(1).max(90).default(30)
})
