import bcrypt from 'bcryptjs'
import pool from '../db/init.js'

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database...')

        // 1. Create Admin Tenant
        const adminTenantResult = await pool.query(`
      INSERT INTO tenants (name, type)
      VALUES ('Asset3D Admin', 'admin')
      RETURNING id
    `)
        const adminTenantId = adminTenantResult.rows[0].id
        console.log('✅ Created Admin Tenant:', adminTenantId)

        // 2. Create Admin User
        const passwordHash = await bcrypt.hash('demo123', 10)
        await pool.query(`
      INSERT INTO users (tenant_id, email, password_hash, name, role, is_active)
      VALUES ($1, 'admin@asset3d.no', $2, 'Admin User', 'admin', true)
    `, [adminTenantId, passwordHash])
        console.log('✅ Created Admin User: admin@asset3d.no / demo123')

        // 3. Create Demo Group Tenant
        const groupTenantResult = await pool.query(`
      INSERT INTO tenants (name, type)
      VALUES ('Demo Group', 'group')
      RETURNING id
    `)
        const groupTenantId = groupTenantResult.rows[0].id
        console.log('✅ Created Demo Group Tenant')

        // 4. Create Group Admin User
        await pool.query(`
      INSERT INTO users (tenant_id, email, password_hash, name, role, is_active)
      VALUES ($1, 'group@asset3d.no', $2, 'Group Admin', 'group', true)
    `, [groupTenantId, passwordHash])
        console.log('✅ Created Group Admin User: group@asset3d.no / demo123')

        console.log('✨ Seeding completed successfully!')
        process.exit(0)
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    }
}

seedDatabase()
