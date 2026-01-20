import express from 'express';
import { getTemperatures } from './weather';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/api/belgrade/temperature', async (req, res) => {
  try {
    const temperatures = await getTemperatures();
    res.json({
      location: 'Belgrade',
      temperatures,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching temperatures:', error);
    res.status(500).json({
      error: 'Failed to fetch temperature data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Weather service running on http://localhost:${PORT}`);
  console.log(`Use GET /api/belgrade/temperature to fetch Belgrade temperatures around 14:00`);
  console.log(`Use GET /health for health check`);
});
