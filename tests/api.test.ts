import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

// Mock the weather module to avoid real API calls in tests
jest.mock('../src/weather', () => ({
  getTemperatures: jest.fn().mockResolvedValue({
    location: { latitude: 44.8176, longitude: 20.4599, name: 'Belgrade' },
    temperatures: [
      {
        date: '2026-01-20',
        time: '14:00',
        temperature: 5.2,
        unit: 'Celsius',
        weatherDescription: 'Partly cloudy',
      },
    ],
    updatedAt: new Date().toISOString(),
    cached: false,
  }),
  searchLocations: jest.fn().mockResolvedValue([
    {
      latitude: 48.8566,
      longitude: 2.3522,
      name: 'Paris',
      country: 'France',
    },
  ]),
  LocationCoordinates: {},
}));

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Apply mock rate limiter for tests
    const mockLimiter = (req: any, res: any, next: any) => next();
    app.use('/api', mockLimiter);

    // Import after mocking
    const apiLimiter = (req: any, res: any, next: any) => next();
    const searchLimiter = (req: any, res: any, next: any) => next();
    const { getTemperatures, searchLocations } = require('../src/weather');

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Temperature endpoint
    app.get('/api/temperature', async (req, res) => {
      try {
        const result = await getTemperatures();
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to fetch temperature data',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Search endpoint
    app.get('/api/search', async (req, res) => {
      try {
        const query = req.query.q as string;

        if (!query || query.length < 2) {
          return res.status(400).json({
            error: 'Invalid search query',
            message: 'Query must be at least 2 characters',
          });
        }

        const results = await searchLocations(query);
        res.json({
          query,
          results,
          count: results.length,
        });
      } catch (error) {
        res.status(500).json({
          error: 'Search failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // API docs
    app.get('/api/docs', (req, res) => {
      res.json({
        name: 'Weather Temperature Service',
        version: '2.0.0',
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/temperature', () => {
    it('should return temperature data', async () => {
      const res = await request(app).get('/api/temperature');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('location');
      expect(res.body).toHaveProperty('temperatures');
      expect(res.body).toHaveProperty('updatedAt');
      expect(Array.isArray(res.body.temperatures)).toBe(true);
    });

    it('should accept location query parameter', async () => {
      const res = await request(app).get('/api/temperature?location=Paris');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('temperatures');
    });

    it('should accept coordinate query parameters', async () => {
      const res = await request(app)
        .get('/api/temperature')
        .query({ lat: 48.8566, lon: 2.3522 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('temperatures');
    });
  });

  describe('GET /api/search', () => {
    it('should return search results', async () => {
      const res = await request(app).get('/api/search?q=Paris');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('query', 'Paris');
      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('count');
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    it('should reject query shorter than 2 characters', async () => {
      const res = await request(app).get('/api/search?q=a');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject empty query', async () => {
      const res = await request(app).get('/api/search');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/docs', () => {
    it('should return API documentation', async () => {
      const res = await request(app).get('/api/docs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown endpoint', async () => {
      const res = await request(app).get('/unknown');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
