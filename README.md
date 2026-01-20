# Belgrade Weather Service

A small TypeScript/Node.js service that provides daily temperature data for Belgrade around 14:00 (2:00 PM) through a custom REST API.

## Features

- Fetches weather data from Open-Meteo API
- Returns daily temperatures around 14:00
- Simple REST API endpoint
- Health check endpoint
- Docker support for instant deployment
- TypeScript for type safety

## API Endpoints

### Get Belgrade Temperature
```
GET /api/belgrade/temperature
```

**Response:**
```json
{
  "location": "Belgrade",
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
  "updatedAt": "2026-01-20T10:30:45.123Z"
}
```

### Health Check
```
GET /health
```

## Setup

### Prerequisites
- Node.js 18+
- Docker (optional)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

3. Build and start:
```bash
npm run build
npm start
```

The service will be available at `http://localhost:3000`

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t belgrade-weather-service .
```

2. Run the container:
```bash
docker run -p 3000:3000 belgrade-weather-service
```

Or use docker-compose:
```bash
docker-compose up -d
```

## API Data Source

The service uses the Open-Meteo free API for weather data, which includes:
- Hourly temperature readings
- Weather codes and descriptions
- 16-day forecast

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Project Structure

```
├── src/
│   ├── index.ts       # Express server setup
│   └── weather.ts     # Weather data fetching logic
├── dist/              # Compiled JavaScript
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## License

MIT
