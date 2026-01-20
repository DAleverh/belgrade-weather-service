# Quick Start Guide

Welcome to the **Weather Temperature Service**! This guide will help you get started quickly.

## 🚀 Fastest Way to Start

### Option 1: Docker (Recommended - 1 minute)

```bash
docker-compose up -d
open http://localhost:3000
```

✅ Done! Visit `http://localhost:3000` in your browser.

### Option 2: Local (3 minutes)

```bash
npm install
npm run dev
open http://localhost:3000
```

### Option 3: Build & Run

```bash
npm install
npm run build
npm start
```

---

## 🎯 What You Can Do

### Via Web UI
1. Go to `http://localhost:3000`
2. Select a tab:
   - **Location**: Type city name (e.g., "Paris")
   - **Coordinates**: Enter lat/lon (e.g., 48.8566, 2.3522)
   - **Search**: Find cities and select one
3. Click "Get Temperature"
4. View results!

### Via API

#### Get Belgrade temperature (default)
```bash
curl http://localhost:3000/api/temperature
```

#### Get any city temperature
```bash
curl "http://localhost:3000/api/temperature?location=Paris"
```

#### Get by coordinates
```bash
curl "http://localhost:3000/api/temperature?lat=48.8566&lon=2.3522"
```

#### Search for locations
```bash
curl "http://localhost:3000/api/search?q=New"
```

#### Health check
```bash
curl http://localhost:3000/health
```

#### API documentation
```bash
curl http://localhost:3000/api/docs
```

---

## 📊 Example Response

```json
{
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522,
    "name": "Paris, France"
  },
  "temperatures": [
    {
      "date": "2026-01-20",
      "time": "14:00",
      "temperature": 5.2,
      "unit": "Celsius",
      "weatherDescription": "Partly cloudy"
    }
  ],
  "updatedAt": "2026-01-20T10:30:45.123Z",
  "cached": false
}
```

---

## 🧪 Run Tests

```bash
npm test
```

**Expected Output:**
```
Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
```

---

## 📚 Documentation

- **README.md** - Complete documentation, setup, API reference
- **ADVANCED.md** - Rate limiting, caching, testing, security
- **/api/docs** - Live API documentation (when server running)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Use `PORT=8080 npm start` or `docker-compose up` |
| Location not found | Use `/api/search?q=<name>` to find correct name |
| Rate limit exceeded | Wait 15 minutes or add `?refresh=false` |
| API timeout | Check internet, verify weather API access |

---

## 🔗 Useful Links

- **Web UI**: `http://localhost:3000`
- **API Docs**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/health`
- **Temperature Endpoint**: `http://localhost:3000/api/temperature`
- **Search Endpoint**: `http://localhost:3000/api/search`

---

## ✨ Key Features

✅ Multi-location support (any city worldwide)  
✅ Location search by name  
✅ Query by latitude/longitude  
✅ Beautiful responsive web interface  
✅ Rate limiting (100 req/15min)  
✅ Response caching (1 hour)  
✅ Automated tests (21 tests)  
✅ Full REST API  
✅ Docker ready  
✅ Comprehensive documentation  

---

## 📦 What's Included

```
.
├── Web UI (http://localhost:3000)
├── REST API (/api/temperature, /api/search, /health)
├── 21 Automated Tests
├── Docker Support
├── Rate Limiting
├── Response Caching
└── Complete Documentation
```

---

## 🚀 Next Steps

1. **Explore the Web UI**
   - Go to http://localhost:3000
   - Try different locations
   - See temperature data and weather

2. **Test the API**
   - Use provided curl examples
   - Try different locations/coordinates
   - Check API documentation at /api/docs

3. **Read Documentation**
   - README.md for complete guide
   - ADVANCED.md for advanced features
   - Source code comments for details

4. **Deploy to Production**
   - Use Docker image for instant deployment
   - Configure environment variables
   - Set up reverse proxy for HTTPS
   - See README.md for details

---

## 🎓 Learning Resources

- **API Examples**: See README.md section "API Examples"
- **Rate Limiting**: See ADVANCED.md section "Rate Limiting"
- **Caching**: See ADVANCED.md section "Caching Strategy"
- **Testing**: See ADVANCED.md section "Testing"
- **Source Code**: See `src/` directory with comments

---

## 💡 Tips

1. **First request** for a location takes 200-500ms (fetches data)
2. **Subsequent requests** take 10-50ms (cached)
3. **Use `?refresh=true`** to bypass cache
4. **Search for locations** to find exact spelling
5. **Check `/api/docs`** for complete API reference

---

## 🎉 You're All Set!

Start exploring weather data! For detailed documentation, see [README.md](README.md).

**Need help?** Check troubleshooting section above or review documentation files.

Happy weather tracking! 🌤️
