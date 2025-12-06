
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Define mocks before importing the module under test
jest.unstable_mockModule('../db/init.js', () => ({
  query: jest.fn()
}));

// Import modules after mocking
const locationsRouter = (await import('./locations.js')).default;
const mockDB = (await import('../db/mockData.js')).default;

// Set USE_MOCK_DB env var
process.env.USE_MOCK_DB = 'true';

const app = express();
app.use(express.json());

// Add middleware to simulate authenticated user
app.use((req, res, next) => {
  req.user = {
    tenantId: 'mock-tenant-id'
  };
  next();
});

app.use('/api/locations', locationsRouter);

describe('Locations Routes (Mock Mode)', () => {
  beforeEach(() => {
    // Reset mock data
    mockDB.locations = [];
    mockDB.floors = [];
    mockDB.rooms = [];
  });

  describe('GET /api/locations', () => {
    it('should return empty list when no locations exist', async () => {
      const response = await request(app).get('/api/locations');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return locations for current tenant with floor count', async () => {
      mockDB.locations.push({
        id: 'loc1',
        tenant_id: 'mock-tenant-id',
        name: 'Test Location',
        created_at: new Date().toISOString()
      });

      mockDB.floors.push(
        { id: 'floor1', location_id: 'loc1' },
        { id: 'floor2', location_id: 'loc1' }
      );

      const response = await request(app).get('/api/locations');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe('loc1');
      expect(response.body[0].floor_count).toBe(2);
    });
  });

  describe('POST /api/locations', () => {
    it('should create a new location', async () => {
      const newLocation = {
        name: 'New HQ',
        address: 'Test Street 1',
        postalCode: '1234',
        city: 'Test City'
      };

      const response = await request(app)
        .post('/api/locations')
        .send(newLocation);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newLocation.name);
      expect(response.body.tenant_id).toBe('mock-tenant-id');
      expect(mockDB.locations).toHaveLength(1);
    });
  });
});
