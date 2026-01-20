import express from 'express';
import rateLimit from 'express-rate-limit';
import { getTemperatures, searchLocations, LocationCoordinates } from './weather';
import { getWebUI } from './ui';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for search: 30 requests per 15 minutes
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many search requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Web UI route
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(getWebUI());
});

// API Routes

/**
 * GET /api/temperature
 * Get temperature for a location
 * Query params:
 *   - location: location name (e.g., "Belgrade") or use coords
 *   - lat: latitude (if location not provided)
 *   - lon: longitude (if location not provided)
 *   - refresh: force refresh cache (true/false)
 */
app.get('/api/temperature', async (req, res) => {
  try {
    let location: LocationCoordinates | string | undefined;
    const refresh = req.query.refresh === 'true';

    if (req.query.location) {
      location = req.query.location as string;
    } else if (req.query.lat && req.query.lon) {
      location = {
        latitude: parseFloat(req.query.lat as string),
        longitude: parseFloat(req.query.lon as string),
      };
    }

    const result = await getTemperatures(location, refresh);
    res.json(result);
  } catch (error) {
    console.error('Error fetching temperatures:', error);
    res.status(500).json({
      error: 'Failed to fetch temperature data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Legacy route for backwards compatibility
app.get('/api/belgrade/temperature', async (req, res) => {
  try {
    const result = await getTemperatures();
    res.json(result);
  } catch (error) {
    console.error('Error fetching temperatures:', error);
    res.status(500).json({
      error: 'Failed to fetch temperature data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/search
 * Search for locations by name
 * Query params:
 *   - q: search query (required)
 */
app.get('/api/search', searchLimiter, async (req, res) => {
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
    console.error('Error searching locations:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Weather Temperature Service',
    version: '2.0.0',
    endpoints: {
      'GET /': 'Web UI interface',
      'GET /health': 'Health check',
      'GET /api/temperature': 'Get temperature for location (default: Belgrade)',
      'GET /api/belgrade/temperature': 'Get Belgrade temperature (legacy)',
      'GET /api/search': 'Search for locations by name',
      'GET /api/docs': 'API documentation',
    },
    parameters: {
      temperature: {
        location: 'Location name (string)',
        lat: 'Latitude (number)',
        lon: 'Longitude (number)',
        refresh: 'Force cache refresh (boolean)',
      },
      search: {
        q: 'Search query (string, min 2 chars)',
      },
    },
    examples: {
      belgradeTemperature: '/api/temperature',
      parisTemperature: '/api/temperature?location=Paris',
      customCoords: '/api/temperature?lat=48.8566&lon=2.3522',
      searchCities: '/api/search?q=New',
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      search: '30 requests per 15 minutes',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: 'GET /api/docs',
  });
});

app.listen(PORT, () => {
  console.log(`Weather service running on http://localhost:${PORT}`);
  console.log(`Web UI: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/temperature`);
  console.log(`Docs: http://localhost:${PORT}/api/docs`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
