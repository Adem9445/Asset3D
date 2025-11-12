import bcrypt from 'bcryptjs'

// In-memory database for demo purposes
const mockDB = {
  tenants: [],
  users: [],
  locations: [],
  floors: [],
  rooms: [],
  assets: [],
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
    { id: '2', name: 'IT-utstyr', icon: 'computer' },
    { id: '3', name: 'Kontorutstyr', icon: 'printer' },
    { id: '4', name: 'Kjøkkenutstyr', icon: 'coffee' },
    { id: '5', name: 'Rekvisita', icon: 'package' }
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
