import express from 'express'
import { query } from '../db/init.js'
import { requireRole } from '../modules/security/middleware/rbac.js'

const router = express.Router()

const useMock = () => process.env.USE_MOCK_DB === 'true'

const getMockDb = async () => {
    const module = await import('../db/mockData.js')
    return module.default
}

// Get all suppliers for tenant
router.get('/', async (req, res) => {
    try {
        if (useMock()) {
            const mockDB = await getMockDb()
            let suppliers = mockDB.suppliers || []

            if (req.user.role === 'admin') {
                // Admin can see all
            } else if (req.user.role === 'group') {
                // Group admin can see suppliers in their group's companies
                const tenants = mockDB.tenants.filter(t => t.id === req.user.tenantId || t.parent_tenant_id === req.user.tenantId)
                const tenantIds = tenants.map(t => t.id)
                suppliers = suppliers.filter(s => tenantIds.includes(s.tenant_id))
            } else {
                // Others can only see suppliers in their tenant
                suppliers = suppliers.filter(s => s.tenant_id === req.user.tenantId)
            }

            return res.json(suppliers)
        }

        let queryStr = `
      SELECT * FROM suppliers
    `
        let params = []

        if (req.user.role === 'admin') {
            // Admin can see all
            queryStr += ' ORDER BY created_at DESC'
        } else if (req.user.role === 'group') {
            // Group admin can see suppliers in their group's companies
            queryStr += `
        WHERE tenant_id IN (
          SELECT id FROM tenants 
          WHERE id = $1 OR parent_tenant_id = $1
        )
        ORDER BY created_at DESC
      `
            params = [req.user.tenantId]
        } else {
            // Others can only see suppliers in their tenant
            queryStr += ' WHERE tenant_id = $1 ORDER BY created_at DESC'
            params = [req.user.tenantId]
        }

        const { rows } = await query(queryStr, params)
        res.json(rows)
    } catch (error) {
        console.error('Get suppliers error:', error)
        res.status(500).json({ message: 'Kunne ikke hente leverandører' })
    }
})

// Get single supplier
router.get('/:id', async (req, res) => {
    try {
        if (useMock()) {
            const mockDB = await getMockDb()
            const supplier = mockDB.suppliers.find(s => s.id === req.params.id)

            if (!supplier) {
                return res.status(404).json({ message: 'Leverandør ikke funnet' })
            }

            // Check access
            if (req.user.role !== 'admin') {
                if (req.user.role === 'group') {
                    // Check if supplier belongs to group hierarchy
                    const tenant = mockDB.tenants.find(t => t.id === supplier.tenant_id)
                    if (tenant.id !== req.user.tenantId && tenant.parent_tenant_id !== req.user.tenantId) {
                        return res.status(403).json({ message: 'Ingen tilgang' })
                    }
                } else if (supplier.tenant_id !== req.user.tenantId) {
                    return res.status(403).json({ message: 'Ingen tilgang' })
                }
            }

            return res.json(supplier)
        }

        const { rows } = await query(
            'SELECT * FROM suppliers WHERE id = $1',
            [req.params.id]
        )

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Leverandør ikke funnet' })
        }

        const supplier = rows[0]

        // Check access
        if (req.user.role !== 'admin') {
            // TODO: Implement proper group check for DB mode if needed
            if (req.user.role !== 'group' && supplier.tenant_id !== req.user.tenantId) {
                return res.status(403).json({ message: 'Ingen tilgang' })
            }
        }

        res.json(supplier)
    } catch (error) {
        console.error('Get supplier error:', error)
        res.status(500).json({ message: 'Kunne ikke hente leverandør' })
    }
})

// Create supplier
router.post('/', requireRole('admin', 'company', 'group'), async (req, res) => {
    try {
        const { name, category, email, phone, address, tenantId } = req.body

        // Determine tenantId
        let targetTenantId = req.user.tenantId
        if ((req.user.role === 'admin' || req.user.role === 'group') && tenantId) {
            targetTenantId = tenantId
        }

        if (useMock()) {
            const mockDB = await getMockDb()
            const newSupplier = {
                id: Math.random().toString(36).substr(2, 9),
                tenant_id: targetTenantId,
                name,
                category,
                email,
                phone,
                address,
                contracts: 0,
                status: 'Active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            mockDB.suppliers.push(newSupplier)
            return res.status(201).json(newSupplier)
        }

        const { rows } = await query(
            `INSERT INTO suppliers (tenant_id, name, category, email, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [targetTenantId, name, category, email, phone, address]
        )

        res.status(201).json(rows[0])
    } catch (error) {
        console.error('Create supplier error:', error)
        res.status(500).json({ message: 'Kunne ikke opprette leverandør' })
    }
})

export default router
