let currentData;
let tempChart;
let showHourly = true;

// Get the weather data and display it
document.getElementById('submit-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    if (city) {
        fetchWeatherData(city);
    }
});

// Fetch weather data from OpenWeatherMap API
function fetchWeatherData(city) {
    const apiKey ='4eb3703790b356562054106543b748b2'; 
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=40&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        currentData = data;
        displayWeather(data);
    })
    .catch(error => alert('City not found.'));
}

// Display weather information, including hourly data, chart, and map
function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.city.name;
        const temperature = Math.round(data.list[0].main.temp);
        const description = data.list[0].weather[0].description;
        const iconCode = data.list[0].weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const temperatureHTML = `<p>${temperature}°C</p>`;
        const weatherHtml = `<p>${cityName}</p><p>${description}</p>`;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        // Call the function to display hourly data and chart
        displayHourlyForecast(data.list);
        displayTemperatureChart(data.list);
        displayMap(data.city.coord.lat, data.city.coord.lon); // Show the city location on the map

        showImage();
    }
}

// Display hourly forecast data
function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';

    hourlyData.slice(0, 8).forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;
        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

// Toggle between hourly and daily forecast
function toggleForecast() {
    showHourly = !showHourly;
    const forecastDiv = document.getElementById('hourly-forecast');
    forecastDiv.innerHTML = '';

    if (showHourly) {
        displayHourlyForecast(currentData.list);
        displayTemperatureChart(currentData.list);
    } else {
        displayDailyForecast(currentData.list);
    }
}

// Display daily forecast
function displayDailyForecast(dailyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';

    dailyData.slice(0, 7).forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const day = dateTime.toLocaleString('default', { weekday: 'long' });
        const temperature = Math.round(item.main.temp.day);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const dailyItemHtml = `
            <div class="hourly-item">
                <span>${day}</span>
                <img src="${iconUrl}" alt="Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;
        hourlyForecastDiv.innerHTML += dailyItemHtml;
    });
}

// Display Temperature Chart
function displayTemperatureChart(hourlyData) {
    const tempData = hourlyData.slice(0, 8).map(item => item.main.temp);
    const labels = hourlyData.slice(0, 8).map(item => {
        const dateTime = new Date(item.dt * 1000);
        return `${dateTime.getHours()}:00`;
    });

    const ctx = document.getElementById('temp-chart').getContext('2d');
    if (tempChart) tempChart.destroy(); // Destroy previous chart if exists

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData,
                fill: false,
                borderColor: '#FF5733',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.raw}°C`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize OpenStreetMap
function displayMap(lat, lon) {
    const map = L.map('mapid').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
        .bindPopup('Location of ' + currentData.city.name)
        .openPopup();
}

// Show weather icon
function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block';
}
