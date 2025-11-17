import crypto from 'crypto'

const getSecret = () => process.env.CSRF_SECRET || 'asset3d-csrf-secret'

export const createCsrfToken = (userId) => {
  if (!userId) {
    return null
  }

  return crypto.createHash('sha256').update(`${userId}:${getSecret()}`).digest('hex')
}
