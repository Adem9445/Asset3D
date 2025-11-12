import express from 'express'
import pool from '../db/db.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Get all groups (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Mock data for demo
    const mockGroups = [
      {
        id: 1,
        name: 'Nordic Tech Group',
        description: 'Leading technology companies in the Nordic region',
        type: 'group',
        status: 'active',
        created_at: new Date('2024-01-15'),
        companies_count: 3,
        total_employees: 145,
        total_assets: 892,
        total_value: 15600000
      },
      {
        id: 2,
        name: 'Innovation Partners',
        description: 'Collaborative innovation ecosystem',
        type: 'group',
        status: 'active',
        created_at: new Date('2024-02-01'),
        companies_count: 5,
        total_employees: 230,
        total_assets: 1456,
        total_value: 28900000
      },
      {
        id: 3,
        name: 'Green Energy Alliance',
        description: 'Sustainable energy solutions',
        type: 'group',
        status: 'active',
        created_at: new Date('2024-03-10'),
        companies_count: 4,
        total_employees: 189,
        total_assets: 678,
        total_value: 19800000
      }
    ]
    
    res.json(mockGroups)
  } catch (error) {
    console.error('Get groups error:', error)
    res.status(500).json({ message: 'Kunne ikke hente grupper' })
  }
})

// Get single group with companies
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id
    
    // Mock data
    const mockGroup = {
      id: groupId,
      name: 'Nordic Tech Group',
      description: 'Leading technology companies in the Nordic region',
      type: 'group',
      status: 'active',
      created_at: new Date('2024-01-15'),
      contact_email: 'admin@nordictechgroup.no',
      contact_phone: '+47 123 45 678',
      address: 'Innovation Street 1, 0180 Oslo',
      website: 'www.nordictechgroup.no',
      companies: [
        {
          id: 1,
          name: 'TechCorp AS',
          type: 'company',
          status: 'active',
          employees: 45,
          assets: 234,
          value: 5600000,
          address: 'Karl Johans gate 1, Oslo',
          contact: 'ceo@techcorp.no',
          joined_date: '2024-01-20'
        },
        {
          id: 2,
          name: 'DataFlow Solutions',
          type: 'company',
          status: 'active',
          employees: 67,
          assets: 412,
          value: 7200000,
          address: 'Strandgaten 10, Bergen',
          contact: 'info@dataflow.no',
          joined_date: '2024-02-15'
        },
        {
          id: 3,
          name: 'CloudMasters Norge',
          type: 'company',
          status: 'active',
          employees: 33,
          assets: 246,
          value: 2800000,
          address: 'Teknologivegen 22, Trondheim',
          contact: 'hello@cloudmasters.no',
          joined_date: '2024-03-01'
        }
      ],
      stats: {
        total_companies: 3,
        total_employees: 145,
        total_assets: 892,
        total_value: 15600000,
        monthly_growth: 12.5,
        active_contracts: 28
      }
    }
    
    res.json(mockGroup)
  } catch (error) {
    console.error('Get group error:', error)
    res.status(500).json({ message: 'Kunne ikke hente gruppe' })
  }
})

// Create new group
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      contact_email,
      contact_phone,
      address,
      website
    } = req.body
    
    // For demo, return mock created group
    const newGroup = {
      id: Date.now(),
      name,
      description,
      type: 'group',
      status: 'active',
      contact_email,
      contact_phone,
      address,
      website,
      created_at: new Date(),
      companies_count: 0,
      total_employees: 0,
      total_assets: 0,
      total_value: 0
    }
    
    res.status(201).json(newGroup)
  } catch (error) {
    console.error('Create group error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette gruppe' })
  }
})

// Update group
router.put('/:id', authenticateToken, requireRole('admin', 'group'), async (req, res) => {
  try {
    const groupId = req.params.id
    const updates = req.body
    
    // For demo, return updated group
    const updatedGroup = {
      id: groupId,
      ...updates,
      updated_at: new Date()
    }
    
    res.json(updatedGroup)
  } catch (error) {
    console.error('Update group error:', error)
    res.status(500).json({ message: 'Kunne ikke oppdatere gruppe' })
  }
})

// Delete group
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const groupId = req.params.id
    
    // Check if group has companies
    // In real implementation, would check database
    const hasCompanies = false
    
    if (hasCompanies) {
      return res.status(400).json({ 
        message: 'Kan ikke slette gruppe med aktive selskaper. Flytt eller slett selskapene først.' 
      })
    }
    
    res.json({ message: 'Gruppe slettet' })
  } catch (error) {
    console.error('Delete group error:', error)
    res.status(500).json({ message: 'Kunne ikke slette gruppe' })
  }
})

// Add company to group
router.post('/:groupId/companies', authenticateToken, requireRole('admin', 'group'), async (req, res) => {
  try {
    const { groupId } = req.params
    const { companyId } = req.body
    
    // For demo, return success
    res.json({ 
      message: 'Selskap lagt til gruppe',
      groupId,
      companyId
    })
  } catch (error) {
    console.error('Add company to group error:', error)
    res.status(500).json({ message: 'Kunne ikke legge til selskap' })
  }
})

// Remove company from group
router.delete('/:groupId/companies/:companyId', authenticateToken, requireRole('admin', 'group'), async (req, res) => {
  try {
    const { groupId, companyId } = req.params
    
    res.json({ 
      message: 'Selskap fjernet fra gruppe',
      groupId,
      companyId
    })
  } catch (error) {
    console.error('Remove company from group error:', error)
    res.status(500).json({ message: 'Kunne ikke fjerne selskap' })
  }
})

// Get group statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id
    
    const stats = {
      groupId,
      period: 'current_month',
      companies: {
        total: 3,
        active: 3,
        inactive: 0,
        new_this_month: 1
      },
      employees: {
        total: 145,
        growth_rate: 5.2,
        by_company: [
          { company: 'TechCorp AS', count: 45 },
          { company: 'DataFlow Solutions', count: 67 },
          { company: 'CloudMasters Norge', count: 33 }
        ]
      },
      assets: {
        total: 892,
        total_value: 15600000,
        by_category: {
          'Furniture': 324,
          'IT Equipment': 412,
          'Office Supplies': 156
        }
      },
      financial: {
        total_value: 15600000,
        monthly_costs: 890000,
        savings_potential: 125000,
        roi: 18.5
      }
    }
    
    res.json(stats)
  } catch (error) {
    console.error('Get group stats error:', error)
    res.status(500).json({ message: 'Kunne ikke hente statistikk' })
  }
})

// Invite company to group
router.post('/:groupId/invitations', authenticateToken, requireRole('admin', 'group'), async (req, res) => {
  try {
    const { groupId } = req.params
    const { 
      company_email,
      company_name,
      message,
      expires_in_days = 30
    } = req.body
    
    const invitation = {
      id: Date.now(),
      group_id: groupId,
      company_email,
      company_name,
      message,
      status: 'pending',
      token: Math.random().toString(36).substring(7),
      expires_at: new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      created_by: req.user.id
    }
    
    // In real implementation, would send email
    res.status(201).json({
      message: 'Invitasjon sendt',
      invitation
    })
  } catch (error) {
    console.error('Send invitation error:', error)
    res.status(500).json({ message: 'Kunne ikke sende invitasjon' })
  }
})

export default router
