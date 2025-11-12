import bcrypt from 'bcryptjs'

// In-memory database for demo purposes
const mockDB = {
  tenants: [],
  users: [],
  locations: [],
  floors: [],
  rooms: [],
  assets: [],
  buildings: [],
  categories: []
}

export const initMockData = async () => {
  console.log('⚠️  Kjører i DEMO-MODUS uten PostgreSQL database')
  console.log('📝 Bruker in-memory data - endringer vil ikke bli lagret ved restart')
  
  const demoPassword = await bcrypt.hash('demo123', 10)
  
  // Create tenants
  mockDB.tenants = [
    { id: '1', name: 'Asset3D Admin', type: 'admin', parent_tenant_id: null },
    { id: '2', name: 'Demo Group', type: 'group', parent_tenant_id: null },
    { id: '3', name: 'Demo Company', type: 'company', parent_tenant_id: '2' }
  ]
  
  // Create users
  mockDB.users = [
    { 
      id: '1', 
      email: 'admin@asset3d.no', 
      password_hash: demoPassword, 
      name: 'Admin User', 
      role: 'admin', 
      tenant_id: '1',
      is_active: true,
      permissions: []
    },
    { 
      id: '2', 
      email: 'group@asset3d.no', 
      password_hash: demoPassword, 
      name: 'Group Admin', 
      role: 'group', 
      tenant_id: '2',
      is_active: true,
      permissions: []
    },
    { 
      id: '3', 
      email: 'company@asset3d.no', 
      password_hash: demoPassword, 
      name: 'Company Admin', 
      role: 'company', 
      tenant_id: '3',
      is_active: true,
      permissions: []
    },
    { 
      id: '4', 
      email: 'user@asset3d.no', 
      password_hash: demoPassword, 
      name: 'Normal User', 
      role: 'user', 
      tenant_id: '3',
      is_active: true,
      permissions: []
    },
    { 
      id: '5', 
      email: 'supplier@asset3d.no', 
      password_hash: demoPassword, 
      name: 'Supplier User', 
      role: 'supplier', 
      tenant_id: '3',
      is_active: true,
      permissions: []
    }
  ]
  
  // Create categories
  mockDB.categories = [
    { id: '1', name: 'Møbler', icon: 'sofa' },
    { id: '2', name: 'IT Utstyr', icon: 'computer' },
    { id: '3', name: 'Kontorutstyr', icon: 'printer' },
    { id: '4', name: 'Kjøkkenutstyr', icon: 'coffee' },
    { id: '5', name: 'Diverse', icon: 'package' }
  ]

  const now = new Date().toISOString()

  // Demo building structure
  mockDB.buildings = [
    {
      id: 'b1',
      tenant_id: '3',
      name: 'Hovedkontor',
      address: 'Karl Johans gate 1, Oslo',
      data: {
        floors: [
          { id: 'f1', name: '1. etasje' },
          { id: 'f2', name: '2. etasje' }
        ]
      },
      created_at: now,
      updated_at: now,
      created_by: '3'
    }
  ]

  // Demo rooms
  mockDB.rooms = [
    { id: 'r1', building_id: 'b1', tenant_id: '3', name: 'Kontor 101', type: 'office', floor_number: 1 },
    { id: 'r2', building_id: 'b1', tenant_id: '3', name: 'Kontor 102', type: 'office', floor_number: 1 },
    { id: 'r3', building_id: 'b1', tenant_id: '3', name: 'Møterom 201', type: 'meeting', floor_number: 2 },
    { id: 'r4', building_id: 'b1', tenant_id: '3', name: 'Møterom 202', type: 'meeting', floor_number: 2 },
    { id: 'r5', building_id: 'b1', tenant_id: '3', name: 'Kjøkken', type: 'kitchen', floor_number: 1 }
  ]

  mockDB.assets = [
    {
      id: 'a1',
      tenant_id: '3',
      name: 'Ergonomisk kontorstol',
      description: 'Justerbar kontorstol for langvarig bruk',
      category_id: '1',
      room_id: 'r1',
      asset_type: 'chair',
      purchase_price: 4500,
      status: 'active',
      created_at: now,
      metadata: { manufacturer: 'HÅG', warrantyYears: 5 }
    },
    {
      id: 'a2',
      tenant_id: '3',
      name: 'Hev/senk skrivebord',
      description: 'Elektrisk hev/senk skrivebord',
      category_id: '1',
      room_id: 'r1',
      asset_type: 'desk',
      purchase_price: 12000,
      status: 'active',
      created_at: now,
      metadata: { manufacturer: 'Linak', warrantyYears: 3 }
    },
    {
      id: 'a3',
      tenant_id: '3',
      name: 'MacBook Pro 16"',
      description: 'Utviklermaskin',
      category_id: '2',
      room_id: 'r2',
      asset_type: 'computer',
      purchase_price: 28000,
      status: 'active',
      created_at: now,
      metadata: { serialNumber: 'MBP16-2024-001' }
    },
    {
      id: 'a4',
      tenant_id: '3',
      name: 'Kaffemaskin Delonghi',
      description: 'Bønnemaskin for hele avdelingen',
      category_id: '4',
      room_id: 'r5',
      asset_type: 'coffee_machine',
      purchase_price: 8500,
      status: 'active',
      created_at: now,
      metadata: { maintenanceIntervalDays: 30 }
    },
    {
      id: 'a5',
      tenant_id: '3',
      name: 'Projektor BenQ',
      description: 'Full HD projektor',
      category_id: '2',
      room_id: 'r3',
      asset_type: 'projector',
      purchase_price: 12500,
      status: 'active',
      created_at: now,
      metadata: { lampHours: 120 }
    }
  ]

  console.log('✅ Demo-data initialisert')
  console.log('📧 Logg inn med: admin@asset3d.no / demo123')
}

// Mock query function
export const mockQuery = async (text, params = []) => {
  // Simple mock implementation - just return empty results
  return { rows: [], rowCount: 0 }
}

export default mockDB
