# Advanced Features Guide

This document covers the additional enhancements and advanced features of the Belgrade Weather Service.

## Table of Contents

1. [Rate Limiting](#rate-limiting)
2. [Location Search & Geocoding](#location-search--geocoding)
3. [Caching Strategy](#caching-strategy)
4. [Web Interface](#web-interface)
5. [Testing](#testing)
6. [Coordinate-Based Queries](#coordinate-based-queries)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)

---

## Rate Limiting

### Overview

Rate limiting protects the service from API abuse and ensures fair resource allocation among users.

### Implementation

The service uses `express-rate-limit` middleware with per-IP rate limiting:

```typescript
// General API: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // max requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,       // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,        // Disable X-RateLimit-* headers
});

// Search API: 30 requests per 15 minutes (stricter)
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many search requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Response Headers

When rate limiting is active, responses include:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642689045
```

### Exceeding Limits

When rate limit is exceeded, the server responds with:

**Status**: `429 Too Many Requests`

**Response Body**:
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 30
}
```

### Configuration

To modify rate limits, edit `src/index.ts`:

```typescript
// Example: Allow 200 requests per 10 minutes
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 200,                   // 200 requests
});
```

### Per-Route Limits

Different endpoints can have different limits:

```typescript
app.use('/api', apiLimiter);          // General limit
app.use('/api/search', searchLimiter); // Stricter search limit
```

---

## Location Search & Geocoding

### Supported Features

1. **Search by Location Name**: Find cities/locations by name
2. **Reverse Geocoding**: Get coordinates for location names
3. **Multiple Results**: Returns up to 5 matching locations
4. **Multilingual**: Uses English language by default

### API Endpoint

```
GET /api/search?q={query}
```

**Requirements**:
- Query must be at least 2 characters
- Query must be URL-encoded

### Examples

**Search for "New"**:
```bash
curl "http://localhost:3000/api/search?q=New"
```

**Response**:
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
    },
    // ... more results
  ],
  "count": 5
}
```

### Implementation Details

#### Search Function

```typescript
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`;
  // API call and response parsing
}
```

#### Location Resolution

The `getLocationCoordinates` function handles location name to coordinates conversion:

```typescript
export async function getLocationCoordinates(locationName: string): Promise<LocationCoordinates> {
  const results = await searchLocations(locationName);
  if (results.length === 0) {
    throw new Error(`Location "${locationName}" not found`);
  }
  
  const firstResult = results[0];
  return {
    latitude: firstResult.latitude,
    longitude: firstResult.longitude,
    name: `${firstResult.name}, ${firstResult.country}`,
  };
}
```

### Data Source

Uses yr.no (Norwegian Meteorological Institute) weather API:
- **Endpoint**: `https://api.weatherapi.met.no/weatherapi/1.0/complete`
- **Authentication**: None (free service, requires User-Agent header)
- **Rate Limit**: Fair use policy
- **Response Format**: JSON
- **Accuracy**: High precision weather data
- **Coverage**: Worldwide

**Note**: Location search uses Open-Meteo Geocoding API since yr.no doesn't provide a public geocoding service.

---

## Caching Strategy

### Purpose

Caching reduces:
- External API calls
- Response latency
- Network bandwidth
- Load on weather API providers

### Implementation

Uses `node-cache` library with automatic expiration:

```typescript
import NodeCache from 'node-cache';

// Cache with 1-hour TTL
const cache = new NodeCache({ stdTTL: 3600 });
```

### Cache Key Structure

```
temp_<latitude>_<longitude>
```

**Example**: `temp_44.8176_20.4599` (Belgrade)

### Cache Flow

```
Request
  ↓
Check Cache Key
  ↓
  ├─ Cache Hit → Return Cached Data
  │
  └─ Cache Miss/Expired
      ↓
      Fetch from Weather API
      ↓
      Store in Cache
      ↓
      Return Data
```

### Cache Response Indicator

All responses include a `cached` boolean flag:

```json
{
  "temperatures": [...],
  "location": {...},
  "cached": true,  // Indicates data came from cache
  "updatedAt": "2026-01-20T10:30:45.123Z"
}
```

### Force Cache Refresh

To bypass cache, use the `refresh` parameter:

```bash
# Use cache (default)
curl "http://localhost:3000/api/temperature?location=Paris"

# Bypass cache and fetch fresh data
curl "http://localhost:3000/api/temperature?location=Paris&refresh=true"
```

### Cache Configuration

Modify cache settings in `src/weather.ts`:

```typescript
// Example: 30-minute cache
const cache = new NodeCache({ stdTTL: 1800 });
```

### Cache Clearing

Cache is automatically cleared on server restart. To clear programmatically:

```typescript
cache.flushAll();  // Clear all cache
cache.del(cacheKey);  // Clear specific key
```

---

## Web Interface

### Features

The web UI provides a user-friendly interface for temperature queries:

### Tab 1: Location Search

- Enter location by name
- Auto-complete from search suggestions
- Simple, intuitive input

**Example Usage**:
1. Type "Paris"
2. Click "Get Temperature"
3. View temperatures for all available dates

### Tab 2: Coordinates

- Enter latitude and longitude manually
- Useful for precise location queries
- Supports decimal coordinates

**Example**:
- Latitude: 48.8566
- Longitude: 2.3522
- (This is Paris)

### Tab 3: Search

- Search for locations by name
- Browse results with country info
- Click result to load temperatures

**Search Results Show**:
- Location name
- Country
- Latitude/Longitude
- Clickable to load temperatures

### UI Features

1. **Responsive Design**
   - Works on desktop and mobile
   - Adapts to screen size
   - Touch-friendly buttons

2. **Visual Indicators**
   - Loading spinner during API calls
   - Cached data badge
   - Weather descriptions with icons
   - Error messages

3. **Temperature Display**
   - Date and time
   - Current temperature in Celsius
   - Weather description
   - Cached status

4. **Dark Mode Support**
   - Adapts to system preferences
   - Readable in all lighting conditions

### Architecture

The web UI is embedded in the server:

```typescript
// In src/index.ts
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(getWebUI());  // Returns HTML from ui.ts
});
```

The UI is defined in `src/ui.ts` as a single HTML string with embedded CSS and JavaScript.

### Styling

- **Color Scheme**: Purple gradient background
- **Typography**: System fonts for performance
- **Layout**: Flexbox for responsiveness
- **Animations**: Smooth transitions and loading spinner

---

## Testing

### Test Framework

Uses Jest with TypeScript support:

```typescript
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Test Files

#### 1. `tests/weather.test.ts` - Unit Tests

Tests the weather service functions:

```typescript
describe('Weather Service', () => {
  describe('searchLocations', () => {
    it('should search for locations by name', async () => {
      // Test implementation
    });
  });

  describe('getTemperatures', () => {
    it('should get Belgrade temperatures by default', async () => {
      // Test implementation
    });

    it('should get temperatures by location name', async () => {
      // Test implementation
    });

    it('should get temperatures by coordinates', async () => {
      // Test implementation
    });
  });
});
```

**Coverage**:
- Location search functionality
- Coordinate handling
- Temperature data validation
- Date/time format validation
- Response structure

#### 2. `tests/api.test.ts` - Integration Tests

Tests API endpoints:

```typescript
describe('API Routes', () => {
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      // Test implementation
    });
  });

  describe('GET /api/temperature', () => {
    it('should return temperature data', async () => {
      // Test implementation
    });

    it('should accept location query parameter', async () => {
      // Test implementation
    });
  });

  describe('GET /api/search', () => {
    it('should return search results', async () => {
      // Test implementation
    });
  });
});
```

**Coverage**:
- HTTP status codes
- Response format validation
- Query parameter handling
- Error cases
- Rate limiting behavior

### Running Tests

**All tests**:
```bash
npm test
```

**Specific test file**:
```bash
npm test -- tests/weather.test.ts
```

**Watch mode** (re-run on file changes):
```bash
npm run test:watch
```

**Coverage report**:
```bash
npm run test:coverage
```

### Test Results

Expected output:
```
Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        2.542 s
```

---

## Coordinate-Based Queries

### Why Coordinates?

- Precise location specification
- No ambiguity with location names
- Useful for GPS data
- Works for any point on Earth

### Coordinate Format

- **Latitude**: -90 to +90 degrees
- **Longitude**: -180 to +180 degrees
- **Precision**: 4 decimal places (≈ 11 meters)

### API Usage

**Query Parameters**:
- `lat`: Latitude (required if location not provided)
- `lon`: Longitude (required if location not provided)

**Example 1 - New York**:
```bash
curl "http://localhost:3000/api/temperature?lat=40.7128&lon=-74.0060"
```

**Example 2 - Tokyo**:
```bash
curl "http://localhost:3000/api/temperature?lat=35.6762&lon=139.6503"
```

**Example 3 - Sydney**:
```bash
curl "http://localhost:3000/api/temperature?lat=-33.8688&lon=151.2093"
```

### Coordinate Resolution

```typescript
const coordinates: LocationCoordinates = {
  latitude: 48.8566,
  longitude: 2.3522,
  name: 'Paris'  // Optional
};

const result = await getTemperatures(coordinates);
```

### Priority

If multiple parameters are provided:
1. `location` parameter (if provided)
2. `lat` and `lon` parameters (if provided)
3. Default (Belgrade)

---

## Performance Optimization

### Strategies

#### 1. Response Caching

- 1-hour cache TTL
- Cache key based on coordinates
- ~50-100x faster for cached requests

**Impact**: First request 200-500ms → Cached request 10-50ms

#### 2. Rate Limiting

- Prevents resource exhaustion
- Protects upstream APIs
- Enables fair resource allocation

#### 3. Async/Await

- Non-blocking I/O
- Multiple concurrent requests
- Better resource utilization

#### 4. Efficient Search

- Results limited to 5 locations
- Early termination
- Single API call per search

### Monitoring Performance

**Check response times**:
```bash
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/temperature
```

**First request** (uncached): ~0.3-0.5 seconds
**Subsequent requests** (cached): ~0.01-0.05 seconds

### Scaling Considerations

For high-traffic scenarios:
1. Add Redis for distributed caching
2. Implement request queuing
3. Add load balancing
4. Monitor rate limit metrics
5. Consider upstream API rate limits

---

## Security Considerations

### Input Validation

All inputs are validated:

```typescript
// Location search
if (!query || query.length < 2) {
  return 400 Bad Request
}

// Coordinates
if (typeof lat !== 'number' || typeof lon !== 'number') {
  return 400 Bad Request
}
```

### Rate Limiting

- Per-IP rate limiting
- Prevents brute force
- Protects against DoS

### Error Handling

- No sensitive information in error messages
- Graceful degradation
- Proper HTTP status codes

### HTTPS Deployment

For production, deploy behind reverse proxy with HTTPS:

```bash
# Example with nginx
upstream weather_service {
  server localhost:3000;
}

server {
  listen 443 ssl;
  server_name api.example.com;
  
  ssl_certificate /path/to/cert;
  ssl_certificate_key /path/to/key;
  
  location / {
    proxy_pass http://weather_service;
  }
}
```

### CORS Configuration

To enable CORS (if needed):

```typescript
import cors from 'cors';

app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Troubleshooting

### Common Issues

**Issue**: "Location not found"
- **Solution**: Use search endpoint to find correct name
- **Example**: `curl "http://localhost:3000/api/search?q=Paris"`

**Issue**: Rate limit exceeded
- **Solution**: Wait 15 minutes or use cache with `?refresh=false`

**Issue**: API timeout
- **Solution**: Check internet connection, verify weather API accessibility

**Issue**: Empty temperatures array
- **Solution**: Location may not have data around 14:00, try different location

---

## Future Enhancements

Potential improvements:
1. Multiple time intervals (not just 14:00)
2. Historical weather data
3. Weather alerts
4. User preferences/saved locations
5. WebSocket for real-time updates
6. GraphQL API
7. Multi-language UI
8. Advanced analytics

---

## Support & Documentation

- Main README: See [README.md](README.md)
- API Examples: See [README.md#api-examples](README.md#-api-examples)
- Source Code: See [src/](../src/)
- Tests: See [tests/](../tests/)

