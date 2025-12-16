-- Migration: Add new columns to locations table
-- This adds support for the new location data model

ALTER TABLE locations 
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'office',
  ADD COLUMN IF NOT EXISTS floors INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rooms INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employees INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assets INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_locations_tenant_type ON locations(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);
