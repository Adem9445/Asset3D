import crypto from 'crypto'

const getSecret = () => {
  const secret = process.env.CSRF_SECRET
  if (!secret) {
    throw new Error('CSRF_SECRET is not defined')
  }
  return secret
}

export const createCsrfToken = (userId) => {
  if (!userId) {
    return null
  }

  return crypto.createHash('sha256').update(`${userId}:${getSecret()}`).digest('hex')
}
