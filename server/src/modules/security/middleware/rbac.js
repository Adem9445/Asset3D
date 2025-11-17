export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Ikke autentisert',
        message: 'Du må være logget inn for å utføre denne handlingen'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Ingen tilgang',
        message: `Denne handlingen krever en av følgende roller: ${allowedRoles.join(', ')}`
      })
    }

    next()
  }
}

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Ikke autentisert',
        message: 'Du må være logget inn for å utføre denne handlingen'
      })
    }

    if (req.user.role === 'admin') {
      return next()
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Manglende tillatelse',
        message: `Denne handlingen krever tillatelsen: ${permission}`
      })
    }

    next()
  }
}

export const requireTenantAccess = (paramKey = 'tenantId') => {
  return (req, res, next) => {
    const targetTenantId = req.params?.[paramKey] || req.body?.[paramKey]
    if (!targetTenantId) {
      return next()
    }

    if (req.user.role === 'admin') {
      return next()
    }

    if (req.user.role === 'group') {
      const allowedIds = new Set([req.user.tenantId, req.tenantContext?.tenantId])
      if (!allowedIds.has(targetTenantId)) {
        return res.status(403).json({
          error: 'Ingen tilgang',
          message: 'Du har ikke tilgang til denne organisasjonen'
        })
      }
      return next()
    }

    if (targetTenantId !== req.user.tenantId) {
      return res.status(403).json({
        error: 'Ingen tilgang',
        message: 'Du har ikke tilgang til denne organisasjonen'
      })
    }

    next()
  }
}
