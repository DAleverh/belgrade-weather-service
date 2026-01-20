/**
 * Web UI for the weather service
 */
export function getWebUI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Temperature Service</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2em;
        }

        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 0.95em;
        }

        .search-section {
            margin-bottom: 30px;
        }

        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }

        .input-group input {
            flex: 1;
            min-width: 200px;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }

        .input-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        .input-group button {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }

        .input-group button:hover {
            background: #5568d3;
        }

        .input-group button:active {
            transform: scale(0.98);
        }

        .coords-input {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .coords-input input {
            flex: 1;
            min-width: 100px;
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 0.95em;
        }

        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }

        .tab-button {
            padding: 12px 20px;
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            font-weight: 600;
            border-bottom: 3px solid transparent;
            margin-bottom: -2px;
            transition: all 0.3s;
        }

        .tab-button.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .results {
            margin-top: 20px;
        }

        .result-card {
            background: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
            transition: box-shadow 0.3s;
        }

        .result-card:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .location-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }

        .temp-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }

        .temp-item:last-child {
            border-bottom: none;
        }

        .temp-date {
            font-weight: 600;
            color: #333;
        }

        .temp-details {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .temperature {
            font-size: 1.3em;
            font-weight: bold;
            color: #667eea;
        }

        .weather-desc {
            color: #666;
            font-size: 0.9em;
        }

        .cached-badge {
            display: inline-block;
            background: #e8f5e9;
            color: #2e7d32;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75em;
            font-weight: 600;
            margin-top: 5px;
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: #667eea;
        }

        .spinner {
            display: inline-block;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
            border-left: 4px solid #c62828;
        }

        .search-suggestions {
            background: #f0f0f0;
            border-radius: 6px;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 10px;
        }

        .suggestion {
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #e0e0e0;
            transition: background 0.2s;
        }

        .suggestion:hover {
            background: #e0e0e0;
        }

        .suggestion:last-child {
            border-bottom: none;
        }

        .info-text {
            font-size: 0.85em;
            color: #888;
            margin-top: 10px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #999;
            font-size: 0.85em;
        }

        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 1.5em;
            }

            .input-group {
                flex-direction: column;
            }

            .input-group input,
            .input-group button {
                width: 100%;
            }

            .temp-details {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌤️ Weather Temperature Service</h1>
        <p class="subtitle">Get daily temperatures around 14:00 for any location</p>

        <div class="tabs">
            <button class="tab-button active" onclick="switchTab('location')">Location</button>
            <button class="tab-button" onclick="switchTab('coords')">Coordinates</button>
            <button class="tab-button" onclick="switchTab('search')">Search</button>
        </div>

        <!-- Location Search Tab -->
        <div id="location" class="tab-content active">
            <div class="input-group">
                <input type="text" id="locationInput" placeholder="Enter location (e.g., Belgrade, Paris, New York)" 
                       onkeypress="handleKeyPress(event, 'getTemperatureByLocation')">
                <button onclick="getTemperatureByLocation()">Get Temperature</button>
            </div>
            <p class="info-text">Default: Belgrade</p>
            <div id="locationResults" class="results"></div>
        </div>

        <!-- Coordinates Tab -->
        <div id="coords" class="tab-content">
            <div class="input-group coords-input">
                <input type="number" id="latInput" placeholder="Latitude" step="0.0001" 
                       onkeypress="handleKeyPress(event, 'getTemperatureByCoords')">
                <input type="number" id="lonInput" placeholder="Longitude" step="0.0001" 
                       onkeypress="handleKeyPress(event, 'getTemperatureByCoords')">
                <button onclick="getTemperatureByCoords()">Get Temperature</button>
            </div>
            <p class="info-text">Enter latitude and longitude (e.g., <span style="cursor: pointer; color: #667eea; text-decoration: underline;" onclick="fillBelgradCoordinates()">44.8176, 20.4599 for Belgrade</span>)</p>
            <div id="coordsResults" class="results"></div>
        </div>

        <!-- Search Tab -->
        <div id="search" class="tab-content">
            <div class="input-group">
                <input type="text" id="searchInput" placeholder="Search for cities (e.g., New, Paris, Tokyo)" 
                       onkeypress="handleKeyPress(event, 'searchLocations')">
                <button onclick="searchLocations()">Search</button>
            </div>
            <div id="searchResults" class="results"></div>
        </div>

        <div class="footer">
            <p>Data source: yr.no (Norwegian Meteorological Institute) | Temperature measured around 14:00 local time</p>
            <p><a href="/api/docs" style="color: #667eea; text-decoration: none;">API Documentation</a></p>
        </div>
    </div>

    <script>
        function switchTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        function handleKeyPress(event, functionName) {
            if (event.key === 'Enter') {
                window[functionName]();
            }
        }

        function fillBelgradCoordinates() {
            document.getElementById('latInput').value = '44.8176';
            document.getElementById('lonInput').value = '20.4599';
            document.getElementById('latInput').focus();
        }

        function getWeatherEmoji(description) {
            const emojiMap = {
                'Clear sky': '☀️',
                'Fair': '🌤️',
                'Partly cloudy': '⛅',
                'Overcast': '☁️',
                'Fog': '🌫️',
                'Light rain': '🌦️',
                'Rain': '🌧️',
                'Heavy rain': '⛈️',
                'Rain showers': '🌧️',
                'Light rain showers': '🌦️',
                'Heavy rain showers': '⛈️',
                'Rain and thunder': '⛈️',
                'Light rain and thunder': '⛈️',
                'Heavy rain and thunder': '⛈️',
                'Sleet': '🌨️',
                'Light sleet': '🌨️',
                'Heavy sleet': '🌨️',
                'Sleet and thunder': '⛈️',
                'Light sleet and thunder': '⛈️',
                'Heavy sleet and thunder': '⛈️',
                'Sleet showers': '🌨️',
                'Light sleet showers': '🌨️',
                'Heavy sleet showers': '🌨️',
                'Snow': '❄️',
                'Light snow': '❄️',
                'Heavy snow': '🌨️',
                'Snow showers': '🌨️',
                'Light snow showers': '🌨️',
                'Heavy snow showers': '🌨️',
                'Snow and thunder': '⛈️',
                'Light snow and thunder': '⛈️',
                'Rain and snow': '🌨️',
            };
            return emojiMap[description] || '🌡️';
        }

        function showLoading(elementId) {
            document.getElementById(elementId).innerHTML = 
                '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
        }

        function showError(elementId, message) {
            document.getElementById(elementId).innerHTML = 
                \`<div class="error">\${message}</div>\`;
        }

        function displayTemperatures(data, elementId) {
            const location = data.location.name || \`\${data.location.latitude}, \${data.location.longitude}\`;
            const cached = data.cached ? '<span class="cached-badge">Cached</span>' : '';

            let html = \`<div class="result-card">
                <div class="location-name">\${location}</div>
                \${cached}\`;

            if (data.temperatures.length === 0) {
                html += '<p class="info-text">No temperature data available for around 14:00</p>';
            } else {
                data.temperatures.forEach(temp => {
                    const emoji = getWeatherEmoji(temp.weatherDescription);
                    html += \`<div class="temp-item">
                        <div class="temp-date">\${temp.date}</div>
                        <div class="temp-details">
                            <span class="temperature">\${temp.temperature}°C</span>
                            <span class="weather-desc">\${emoji} \${temp.weatherDescription}</span>
                        </div>
                    </div>\`;
                });
            }

            html += '</div>';
            document.getElementById(elementId).innerHTML = html;
        }

        async function getTemperatureByLocation() {
            const location = document.getElementById('locationInput').value.trim();
            const elementId = 'locationResults';

            if (!location) {
                showError(elementId, 'Please enter a location');
                return;
            }

            showLoading(elementId);

            try {
                const response = await fetch(\`/api/temperature?location=\${encodeURIComponent(location)}\`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch temperature data');
                }

                displayTemperatures(data, elementId);
            } catch (error) {
                showError(elementId, error.message);
            }
        }

        async function getTemperatureByCoords() {
            const lat = document.getElementById('latInput').value;
            const lon = document.getElementById('lonInput').value;
            const elementId = 'coordsResults';

            if (!lat || !lon) {
                showError(elementId, 'Please enter both latitude and longitude');
                return;
            }

            showLoading(elementId);

            try {
                const response = await fetch(\`/api/temperature?lat=\${lat}&lon=\${lon}\`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch temperature data');
                }

                displayTemperatures(data, elementId);
            } catch (error) {
                showError(elementId, error.message);
            }
        }

        async function searchLocations() {
            const query = document.getElementById('searchInput').value.trim();
            const elementId = 'searchResults';

            if (!query || query.length < 2) {
                showError(elementId, 'Search query must be at least 2 characters');
                return;
            }

            showLoading(elementId);

            try {
                const response = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Search failed');
                }

                let html = '';
                if (data.count === 0) {
                    html = '<p class="info-text">No locations found</p>';
                } else {
                    data.results.forEach(result => {
                        html += \`<div class="suggestion" onclick="getTemperatureByCoords2(\${result.latitude}, \${result.longitude})">
                            <strong>\${result.name}</strong>, \${result.country}
                            <br>
                            <span class="info-text">Lat: \${result.latitude.toFixed(4)}, Lon: \${result.longitude.toFixed(4)}</span>
                        </div>\`;
                    });
                }

                document.getElementById(elementId).innerHTML = html;
            } catch (error) {
                showError(elementId, error.message);
            }
        }

        function getTemperatureByCoords2(lat, lon) {
            document.getElementById('latInput').value = lat;
            document.getElementById('lonInput').value = lon;
            switchTab('coords');
            getTemperatureByCoords();
        }

        // Load default (Belgrade) on page load
        window.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('locationInput');
        if (input && !input.value.trim()) input.value = 'Belgrade';
        getTemperatureByLocation();
        });
    </script>
</body>
</html>`;
}
