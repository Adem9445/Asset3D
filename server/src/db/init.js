import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/asset3d',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export const query = (text, params) => pool.query(text, params)

export const initDatabase = async () => {
  try {
    // Test database connection
    await query('SELECT NOW()')
    console.log('✅ Database tilkobling OK')
    
    // Create extension for UUIDs
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    // Create tenants table (for multi-tenancy)
    await query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('admin', 'group', 'company')),
        parent_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'group', 'company', 'user', 'supplier')),
        permissions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create locations table
    await query(`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        postal_code VARCHAR(20),
        city VARCHAR(255),
        country VARCHAR(255) DEFAULT 'Norge',
        building_data JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create floors table
    await query(`
      CREATE TABLE IF NOT EXISTS floors (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        floor_number INTEGER NOT NULL,
        layout_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create rooms table
    await query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        room_type VARCHAR(100),
        dimensions JSONB DEFAULT '{}',
        position JSONB DEFAULT '{}',
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create asset_categories table
    await query(`
      CREATE TABLE IF NOT EXISTS asset_categories (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        parent_category_id UUID REFERENCES asset_categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create assets table
    await query(`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        category_id UUID REFERENCES asset_categories(id),
        room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        asset_type VARCHAR(100),
        model_3d_url TEXT,
        thumbnail_url TEXT,
        purchase_date DATE,
        purchase_price DECIMAL(10, 2),
        current_value DECIMAL(10, 2),
        supplier_id UUID,
        serial_number VARCHAR(255),
        barcode VARCHAR(255),
        qr_code VARCHAR(255),
        position JSONB DEFAULT '{}',
        rotation JSONB DEFAULT '{}',
        scale JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create suppliers table
    await query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        address VARCHAR(500),
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create audit_log table for tracking changes
    await query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        changes JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_locations_tenant_id ON locations(tenant_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_assets_tenant_id ON assets(tenant_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_assets_room_id ON assets(room_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id)')
    
    // Insert default data
    await insertDefaultData()
    
    console.log('✅ Database initialisert')
  } catch (error) {
    console.error('❌ Database initialisering feilet:', error)
    throw error
  }
}

const insertDefaultData = async () => {
  try {
    // Check if default data exists
    const { rows: existingCategories } = await query('SELECT COUNT(*) FROM asset_categories')
    if (existingCategories[0].count > 0) return
    
    // Insert default asset categories
    const categories = [
      { name: 'Møbler', icon: 'sofa' },
      { name: 'IT-utstyr', icon: 'computer' },
      { name: 'Kontorutstyr', icon: 'printer' },
      { name: 'Kjøkkenutstyr', icon: 'coffee' },
      { name: 'Rekvisita', icon: 'package' }
    ]
    
    for (const category of categories) {
      await query(
        'INSERT INTO asset_categories (name, icon) VALUES ($1, $2)',
        [category.name, category.icon]
      )
    }
    
    console.log('✅ Standard kategorier opprettet')
  } catch (error) {
    console.error('Kunne ikke legge til standarddata:', error)
  }
}

export default pool
