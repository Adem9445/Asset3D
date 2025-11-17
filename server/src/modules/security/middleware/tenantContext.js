export const tenantContext = (req, res, next) => {
  const headerTenantId = req.headers['x-tenant-id']
  const tenantId = headerTenantId || req.user?.tenantId

  if (!tenantId) {
    return res.status(400).json({
      error: 'Mangler tenant',
      message: 'En gyldig tenant-ID må sendes i X-Tenant-Id header eller være knyttet til brukeren'
    })
  }

  req.tenantContext = {
    tenantId,
    enforceIsolation: req.user?.role !== 'admin'
  }

  next()
}
