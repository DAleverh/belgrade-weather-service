# Belgrade Weather Service - Project Instructions

## Project Overview
This is a TypeScript/Node.js service that provides daily temperature data for Belgrade around 14:00 using weather APIs.

## Setup and Build

### Prerequisites
- Node.js 18+
- Docker (for containerized deployment)

### Local Setup
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Start: `npm start`
4. Development mode: `npm run dev`

### Docker Deployment
- Build image: `docker build -t belgrade-weather-service .`
- Run: `docker run -p 3000:3000 belgrade-weather-service`
- Or use: `docker-compose up -d`

## API Usage
- `GET /api/belgrade/temperature` - Returns Belgrade temperatures around 14:00
- `GET /health` - Health check endpoint

## Key Features
- TypeScript for type safety
- Express.js server
- Open-Meteo API integration
- Docker support
- Temperature filtering for 14:00 time slot
