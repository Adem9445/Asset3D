import { createCsrfToken } from '../tokens/csrfToken.js'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export const csrfGuard = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) {
    return next()
  }

  const headerToken = req.headers['x-csrf-token']

  if (!req.user?.id) {
    return res.status(401).json({
      error: 'Ikke autentisert',
      message: 'CSRF-beskyttelse krever en innlogget bruker'
    })
  }

  const expectedToken = createCsrfToken(req.user.id)

  if (!headerToken || headerToken !== expectedToken) {
    return res.status(403).json({
      error: 'CSRF-beskyttelse',
      message: 'Ugyldig eller manglende X-CSRF-Token header'
    })
  }

  next()
}
