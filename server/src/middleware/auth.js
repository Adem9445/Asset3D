import jwt from 'jsonwebtoken'
import { query } from '../db/init.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Ingen tilgangstoken funnet',
      message: 'Autentisering kreves for denne ressursen' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    let userData = null
    
    // Check if using mock database
    if (process.env.USE_MOCK_DB === 'true') {
      const mockDB = (await import('../db/mockData.js')).default
      const foundUser = mockDB.users.find(u => u.id === decoded.userId && u.is_active)
      if (foundUser) {
        const tenant = mockDB.tenants.find(t => t.id === foundUser.tenant_id)
        userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          tenant_id: foundUser.tenant_id,
          company_name: tenant?.name,
          tenant_type: tenant?.type,
          permissions: foundUser.permissions
        }
      }
    } else {
      // Hent bruker fra database
      const { rows } = await query(
        `SELECT u.*, t.name as company_name, t.type as tenant_type 
         FROM users u 
         LEFT JOIN tenants t ON u.tenant_id = t.id 
         WHERE u.id = $1 AND u.is_active = true`,
        [decoded.userId]
      )
      
      if (rows.length > 0) {
        userData = rows[0]
      }
    }
    
    if (!userData) {
      return res.status(401).json({ 
        error: 'Ugyldig bruker',
        message: 'Brukeren eksisterer ikke eller er deaktivert' 
      })
    }
    
    req.user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      tenantId: userData.tenant_id,
      companyName: userData.company_name,
      tenantType: userData.tenant_type,
      permissions: userData.permissions
    }
    
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token utløpt',
        message: 'Din sesjon har utløpt. Vennligst logg inn på nytt.' 
      })
    }
    
    return res.status(403).json({ 
      error: 'Ugyldig token',
      message: 'Tokenen kunne ikke verifiseres' 
    })
  }
}

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

export const requireTenantAccess = async (req, res, next) => {
  const { tenantId } = req.params
  
  if (!tenantId) {
    return next()
  }
  
  try {
    // Admin har tilgang til alt
    if (req.user.role === 'admin') {
      return next()
    }
    
    // Sjekk om bruker har tilgang til tenant
    if (req.user.role === 'group') {
      // Group admin kan se sine egne selskaper
      const { rows } = await query(
        'SELECT * FROM tenants WHERE id = $1 AND parent_tenant_id = $2',
        [tenantId, req.user.tenantId]
      )
      
      if (rows.length === 0 && tenantId !== req.user.tenantId) {
        return res.status(403).json({ 
          error: 'Ingen tilgang',
          message: 'Du har ikke tilgang til denne organisasjonen' 
        })
      }
    } else {
      // Andre brukere kan bare se sin egen tenant
      if (tenantId !== req.user.tenantId) {
        return res.status(403).json({ 
          error: 'Ingen tilgang',
          message: 'Du har ikke tilgang til denne organisasjonen' 
        })
      }
    }
    
    next()
  } catch (error) {
    console.error('Tenant access check error:', error)
    res.status(500).json({ 
      error: 'Serverfeil',
      message: 'Kunne ikke verifisere tilgang' 
    })
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
    
    // Admin har alle tillatelser
    if (req.user.role === 'admin') {
      return next()
    }
    
    // Sjekk spesifikke tillatelser
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Manglende tillatelse',
        message: `Denne handlingen krever tillatelsen: ${permission}` 
      })
    }
    
    next()
  }
}
