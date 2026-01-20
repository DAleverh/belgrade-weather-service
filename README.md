# Weather Temperature Service

A production-ready TypeScript/Node.js service that provides daily temperature data around 14:00 (2:00 PM) for any location through a REST API and interactive web interface.

## 🌟 Features

- **Multi-Location Support**: Get temperatures for Belgrade or any location worldwide
- **Location Search**: Find cities by name using geocoding
- **Coordinate Support**: Query by latitude/longitude
- **Rate Limiting**: Protection against API overload (100 req/15min general, 30 req/15min for search)
- **Response Caching**: 1-hour cache to minimize API calls
- **Web Interface**: Beautiful, responsive UI for browser access
- **REST API**: Comprehensive JSON API
- **Type Safety**: Full TypeScript support with strict typing
- **Automated Tests**: Unit and integration tests with Jest
- **Docker Ready**: Instant deployment with Docker/Docker Compose
- **Weather Descriptions**: Includes weather conditions from WMO codes

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Web Interface](#web-interface)
- [Installation](#installation)
- [Configuration](#configuration)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Architecture](#architecture)
- [Rate Limiting](#rate-limiting)
- [Caching Strategy](#caching-strategy)
- [License](#license)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
docker build -t belgrade-weather-service .
docker run --rm -p 3000:3000 belgrade-weather-service
```

Or with Docker Compose:
```bash
docker-compose up -d
```

Access the web interface at `http://localhost:3000`

### Local Development

```bash
npm install
npm run dev
```

### Build and Run

```bash
npm run build
npm start
```

## 📚 API Documentation

### Data Source

This service uses the **yr.no** (Norwegian Meteorological Institute) weather API for reliable, accurate weather data.

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Get Temperature for Location

**Request:**
```
GET /api/temperature
GET /api/belgrade/temperature (legacy)
```

**Query Parameters:**
- `location` (string, optional): Location name - e.g., "Belgrade", "Paris", "Tokyo"
- `lat` (number, optional): Latitude coordinate
- `lon` (number, optional): Longitude coordinate
- `refresh` (boolean, optional): Force cache refresh - default: false

**Examples:**

Belgrade (default):
```bash
curl http://localhost:3000/api/temperature
```

Specific location:
```bash
curl http://localhost:3000/api/temperature?location=Paris
```

By coordinates:
```bash
curl "http://localhost:3000/api/temperature?lat=48.8566&lon=2.3522"
```

Force refresh cache:
```bash
curl "http://localhost:3000/api/temperature?location=Tokyo&refresh=true"
```

**Response:**
```json
{
  "location": {
    "latitude": 44.8176,
    "longitude": 20.4599,
    "name": "Belgrade, Serbia"
  },
  "temperatures": [
    {
      "date": "2026-01-20",
      "time": "14:00",
      "temperature": 5.2,
      "unit": "Celsius",
      "weatherDescription": "Partly cloudy"
    },
    {
      "date": "2026-01-21",
      "time": "14:00",
      "temperature": 4.8,
      "unit": "Celsius",
      "weatherDescription": "Overcast"
    }
  ],
  "updatedAt": "2026-01-20T10:30:45.123Z",
  "cached": false
}
```

#### 2. Search Locations

**Request:**
```
GET /api/search?q={query}
```

**Query Parameters:**
- `q` (string, required): Search query - minimum 2 characters

**Examples:**

```bash
curl "http://localhost:3000/api/search?q=New"
```

```bash
curl "http://localhost:3000/api/search?q=Paris"
```

**Response:**
```json
{
  "query": "New",
  "results": [
    {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "name": "New York",
      "country": "United States"
    },
    {
      "latitude": -41.2865,
      "longitude": 174.7762,
      "name": "New Zealand",
      "country": "New Zealand"
    }
  ],
  "count": 2
}
```

#### 3. Health Check

**Request:**
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T10:30:45.123Z"
}
```

#### 4. API Documentation

**Request:**
```
GET /api/docs
```

Returns full API documentation in JSON format.

### Response Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters (e.g., search query too short)
- `404 Not Found`: Endpoint not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## 🌐 Web Interface

The web UI is available at `http://localhost:3000` and includes:

### Features
- **Location Search Tab**: Enter city names to get temperatures
- **Coordinates Tab**: Input latitude/longitude directly
- **Search Tab**: Browse and select from search results
- **Auto-complete**: Click search results to load temperatures
- **Responsive Design**: Works on desktop and mobile
- **Caching Indicator**: Shows when data is from cache
- **Dark Mode Support**: Adapts to system preferences

### Tabs

1. **Location**: Enter location by name (e.g., "Belgrade", "Paris")
2. **Coordinates**: Enter latitude and longitude manually
3. **Search**: Search for cities and select from results

## 💾 Installation

### Prerequisites
- Node.js 18+ or Docker
- npm or yarn

### Development Setup

```bash
# Clone repository
git clone <your-repo-url>
cd belgrade-weather-service

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test:coverage
```

### Production Setup

```bash
# Install production dependencies
npm ci --only=production

# Build
npm run build

# Start server
npm start
```

## ⚙️ Configuration

### Environment Variables

- `PORT` (default: 3000): Server port
- `NODE_ENV` (default: development): Environment mode

```bash
PORT=8080 NODE_ENV=production npm start
```

### Rate Limiting Configuration

Configured in `src/index.ts`:
- **General API**: 100 requests per 15 minutes
- **Search API**: 30 requests per 15 minutes

To modify limits, edit the `rateLimit()` configuration in `src/index.ts`.

### Cache Configuration

Configured in `src/weather.ts`:
- **Cache TTL**: 3600 seconds (1 hour)
- **Cache key**: Based on location coordinates

To modify cache, edit `NodeCache` configuration.

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

### Test Files

- `tests/weather.test.ts`: Weather service unit tests
- `tests/api.test.ts`: API integration tests

Tests cover:
- Location search functionality
- Temperature data fetching
- Coordinate handling
- Response validation
- API endpoints
- Error handling
- Rate limiting
- Caching behavior

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t belgrade-weather-service .
```

### Run Docker Container

```bash
docker run -p 3000:3000 belgrade-weather-service
```

### Docker Compose

```bash
docker-compose up -d
```

### Environment in Docker

```bash
docker run -p 3000:3000 -e PORT=8080 -e NODE_ENV=production belgrade-weather-service
```

## 🏗️ Architecture

### Project Structure

```
belgrade-weather-service/
├── src/
│   ├── index.ts          # Express server, routes, middleware
│   ├── weather.ts        # Weather data fetching (yr.no), caching, location search
│   └── ui.ts             # Web interface HTML/CSS/JS
├── tests/
│   ├── weather.test.ts   # Weather service tests
│   └── api.test.ts       # API endpoint tests
├── dist/                 # Compiled JavaScript
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest testing configuration
└── README.md             # This file
```

### Data Flow

1. **Client Request** → Express Server
2. **Route Handler** → Check Rate Limit
3. **Location Resolution** → Geocoding API (if needed)
4. **Cache Check** → NodeCache
5. **Weather Fetch** → yr.no API (if not cached)
6. **Response** → JSON + Cache

### External APIs

- **yr.no Weather API**: `https://api.met.no/weatherapi/locationforecast/2.0/complete`
  - Weather data retrieval
  - No authentication required (with User-Agent header)
  - Rate limiting: Fair use policy
  - Provides accurate Norwegian meteorological data

- **Open-Meteo Geocoding API**: `https://geocoding-api.open-meteo.com`
  - Location search only (yr.no doesn't provide geocoding)
  - Coordinates to names
  - No authentication required

## 🛡️ Rate Limiting

### Strategy

- **Per-IP limiting**: Limits are per client IP
- **Time-based windows**: 15-minute sliding windows
- **Graceful degradation**: Returns 429 with retry information

### Headers

Response includes rate limit headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642689045
```

### Configuration

Edit `src/index.ts` to adjust limits:

```typescript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  // ... other options
});
```

## 💾 Caching Strategy

### How It Works

1. **Key Generation**: `temp_<latitude>_<longitude>`
2. **TTL**: 3600 seconds (1 hour)
3. **Manual Refresh**: Pass `refresh=true` query parameter
4. **Indicator**: Response includes `cached` boolean flag

### Cache Benefits

- Reduces API calls to weather provider
- Faster response times
- Better reliability during network issues
- Respects fair use policies

### Example

First request (not cached):
```bash
curl http://localhost:3000/api/temperature?location=Paris
# Response includes: "cached": false
```

Second request within 1 hour (cached):
```bash
curl http://localhost:3000/api/temperature?location=Paris
# Response includes: "cached": true
```

Force refresh:
```bash
curl "http://localhost:3000/api/temperature?location=Paris&refresh=true"
# Response includes: "cached": false
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Use for:
- Load balancer health checks
- Kubernetes liveness probes
- Uptime monitoring

### API Logs

Service logs include:
- Request timestamps
- Location queries
- API call counts
- Error messages

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Coordinates and search queries validated
- **Error Handling**: No sensitive information in error messages
- **CORS**: Can be configured as needed
- **HTTPS**: Can be deployed behind reverse proxy

## 🚀 Performance

### Optimizations

- **Caching**: 1-hour cache reduces redundant API calls
- **Compression**: Express built-in compression (when needed)
- **Async/Await**: Non-blocking I/O operations
- **Efficient Search**: Results limited to 5 locations

### Typical Response Times

- **First Request**: 200-500ms (API call included)
- **Cached Request**: 10-50ms (cache hit)
- **Search Query**: 150-400ms

## 📝 API Examples

### JavaScript/Node.js

```javascript
// Get Belgrade temperature
fetch('http://localhost:3000/api/temperature')
  .then(r => r.json())
  .then(data => console.log(data));

// Get Paris temperature
fetch('http://localhost:3000/api/temperature?location=Paris')
  .then(r => r.json())
  .then(data => console.log(data));

// Search cities
fetch('http://localhost:3000/api/search?q=New')
  .then(r => r.json())
  .then(data => console.log(data.results));
```

### Python

```python
import requests

# Get temperature
response = requests.get('http://localhost:3000/api/temperature?location=Tokyo')
print(response.json())

# Search
response = requests.get('http://localhost:3000/api/search?q=Paris')
print(response.json()['results'])
```

### cURL

```bash
# Get temperature
curl http://localhost:3000/api/temperature?location=London

# Search
curl "http://localhost:3000/api/search?q=Tokyo"

# Health check
curl http://localhost:3000/health
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Use different port
PORT=8080 npm start

# Or kill existing process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

### API Timeout

- Check internet connection
- Verify weather API is accessible
- Check rate limits haven't been exceeded

### Location Not Found

- Verify spelling
- Try alternative location names
- Use /api/search to find correct name

### Cache Issues

- Clear by restarting service
- Or use `?refresh=true` parameter

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please follow:
1. Run tests: `npm test`
2. Check types: `npm run build`
3. Update documentation
4. Commit with clear messages

## 📞 Support

For issues, questions, or suggestions:
1. Check this README
2. Review API documentation at `/api/docs`
3. Check test files for usage examples
4. Review source code comments

---

**Version**: 2.0.0  
**Last Updated**: January 2026  
**Data Source**: yr.no (Norwegian Meteorological Institute)
