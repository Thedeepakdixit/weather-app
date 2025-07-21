let currentData;
let tempChart;
let showHourly = true;

document.getElementById('weather-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('city-input').value.trim();
  if (!city) return;

  toggleLoader(true);
  await fetchWeatherData(city);
  toggleLoader(false);
  document.getElementById('city-input').value = '';
});

async function fetchWeatherData(city) {
  const apiKey = '4eb3703790b356562054106543b748b2';
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    const data = await res.json();
    if (data.cod !== "200") throw new Error(data.message);

    currentData = data;
    displayWeather(data);
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function displayWeather(data) {
  const first = data.list[0];
  document.getElementById('city-name').textContent = data.city.name;
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${first.weather[0].icon}@2x.png`;
  document.getElementById('description').textContent = first.weather[0].description;
  document.getElementById('temp').textContent = `${Math.round(first.main.temp)}°C`;
  document.getElementById('feels-like').textContent = `${Math.round(first.main.feels_like)}°C`;
  document.getElementById('min-max').textContent = `${Math.round(first.main.temp_min)}°C / ${Math.round(first.main.temp_max)}°C`;
  document.getElementById('humidity').textContent = `${first.main.humidity}%`;
  document.getElementById('wind').textContent = `${first.wind.speed} m/s`;

  document.getElementById('weather-card').style.display = 'block';
  document.getElementById('toggle-btn').style.display = 'inline-block';

  displayHourlyForecast(data.list);
  displayTemperatureChart(data.list);
  displayMap(data.city.coord.lat, data.city.coord.lon);
}

function displayHourlyForecast(list) {
  const forecast = document.getElementById('hourly-forecast');
  forecast.innerHTML = '';
  list.slice(0, 8).forEach(item => {
    const hour = new Date(item.dt * 1000).getHours();
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;
    forecast.innerHTML += `
      <div class="hourly-item">
        <small>${hour}:00</small>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="" width="40">
        <strong>${temp}°C</strong>
      </div>
    `;
  });
}

function displayTemperatureChart(list) {
  const ctx = document.getElementById('temp-chart').getContext('2d');
  const temps = list.slice(0, 8).map(i => i.main.temp);
  const labels = list.slice(0, 8).map(i => new Date(i.dt * 1000).getHours() + ":00");

  if (tempChart) tempChart.destroy();
  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temp (°C)',
        data: temps,
        borderColor: '#4e54c8',
        tension: 0.3,
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

function displayMap(lat, lon) {
  const map = L.map('mapid').setView([lat, lon], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  L.marker([lat, lon]).addTo(map).bindPopup('City Location').openPopup();
}

function toggleLoader(show) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
}

// Optional: Get weather based on user's location on page load
window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiKey = '4eb3703790b356562054106543b748b2';
      toggleLoader(true);
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const data = await res.json();
        currentData = data;
        displayWeather(data);
      } catch (err) {
        console.log("Geolocation fetch failed");
      } finally {
        toggleLoader(false);
      }
    });
  }
};

document.getElementById('toggle-btn').addEventListener('click', () => {
  showHourly = !showHourly;
  if (showHourly) {
    displayHourlyForecast(currentData.list);
  } else {
    displayDailyForecast(currentData.list);
  }
});

function displayDailyForecast(list) {
  const forecast = document.getElementById('hourly-forecast');
  forecast.innerHTML = '';
  const dailyMap = new Map();

  list.forEach(item => {
    const date = new Date(item.dt_txt).toLocaleDateString();
    if (!dailyMap.has(date)) {
      dailyMap.set(date, item);
    }
  });

  for (let [date, item] of dailyMap) {
    forecast.innerHTML += `
      <div class="hourly-item">
        <small>${date}</small>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="" width="40">
        <strong>${Math.round(item.main.temp)}°C</strong>
      </div>
    `;
  }
}
