//load dom
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '43e9f8b6c9be4cdeb4025651241909';
    const apiUrl = 'https://api.weatherapi.com/v1';
    

    const searchInput = document.getElementById('search-input');
    const locationName = document.getElementById('location-name');
    const temperature = document.querySelector('#current-weather .temperature');
    const weatherDescription = document.querySelector('#current-weather .weather-description');
    const dateElement = document.querySelector('#current-weather .date');
    
    const humidity = document.getElementById('humidity');
    const visibility = document.getElementById('visibility');
    const uvIndex = document.getElementById('uv-index');
    const wind = document.getElementById('wind');
    const precipitation = document.getElementById('precipitation');
    const pressure = document.getElementById('pressure');
    
    const forecastGrid = document.getElementById('forecast-grid');
    const historicalWeatherGrid = document.getElementById('historical-weather-grid');
    
    const darkModeToggle = document.getElementById('darkMode');
    const lightModeToggle = document.getElementById('lightMode');
    const celsiusToggle = document.getElementById('celsius');
    const fahrenheitToggle = document.getElementById('fahrenheit');
    
    // make defult in celsius
    let currentUnit = 'C'; 
    
    // Initialize
    fetchWeatherData('Hambantota'); 
    
    // Event Listeners
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
          fetchWeatherData(city);
          searchInput.value = '';
        }
      }
    });
    //Switch mode
    darkModeToggle.addEventListener('click', () => {
      toggleDarkMode(true);
    });
  
    lightModeToggle.addEventListener('click', () => {
      toggleDarkMode(false);
    });
  
    celsiusToggle.addEventListener('click', () => {
      toggleUnit('C');
    });
  
    fahrenheitToggle.addEventListener('click', () => {
      toggleUnit('F');
    });
    

    async function fetchWeatherData(city) {
      try {
        // Fetch Current Weather
        const currentResponse = await fetch(`${apiUrl}/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`);
        if (!currentResponse.ok) throw new Error('City not found');
        const currentData = await currentResponse.json();
        
        // Update Current Weather Section
        updateCurrentWeather(currentData);
        
        // Fetch Forecast-3 days
        const forecastResponse = await fetch(`${apiUrl}/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=3&aqi=no&alerts=no`);
        if (!forecastResponse.ok) throw new Error('Forecast data not found');
        const forecastData = await forecastResponse.json();
        
        // Update Forecast Section
        updateForecast(forecastData);
        
        // Fetch 7-Day Historical Weather
        await fetchHistoricalWeather(city, 7);
        
      } catch (error) {
        alert(error.message);
      }
    }
    
    // Update Current Weather UI
    function updateCurrentWeather(data) {
      locationName.textContent = `${data.location.name}, ${data.location.country}`;
      temperature.textContent = formatTemperature(data.current.temp_c);
      weatherDescription.textContent = data.current.condition.text;
      dateElement.textContent = formatDate(data.location.localtime);
      
      humidity.textContent = `${data.current.humidity}%`;
      visibility.textContent = `${data.current.vis_km} km`;
      uvIndex.textContent = `${data.current.uv}`;
      wind.textContent = `${data.current.wind_kph} km/h`;
      precipitation.textContent = `${data.current.precip_mm} mm`;
      pressure.textContent = `${data.current.pressure_mb} hPa`;
    }
    
    //Update Forecast UI
    function updateForecast(data) {
      forecastGrid.innerHTML = ''; // Clear existing forecast
      
      data.forecast.forecastday.forEach(day => {
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        
        card.innerHTML = `
          <div class="forecast-date">${formatDate(day.date)}</div>
          <div class="forecast-icon">
            <i class="fas ${getWeatherIcon(day.day.condition.code)}"></i>
          </div>
          <div class="forecast-temp">${currentUnit === 'C' ? day.day.avgtemp_c + '°C' : cToF(day.day.avgtemp_c) + '°F'}</div>
          <div class="forecast-description">${day.day.condition.text}</div>
        `;
        
        forecastGrid.appendChild(card);
      });
    }
    
    //  Fetch 7-Day Historical Weather
    async function fetchHistoricalWeather(city, days) {
      historicalWeatherGrid.innerHTML = ''; // Clear existing historical weather
      
      const today = new Date();
      
      for (let i = 1; i <= days; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - i);
        const formattedDate = pastDate.toISOString().split('T')[0];
        
        try {
          const historyResponse = await fetch(`${apiUrl}/history.json?key=${apiKey}&q=${encodeURIComponent(city)}&dt=${formattedDate}`);
          if (!historyResponse.ok) throw new Error(`Historical data for ${formattedDate} not found`);
          const historyData = await historyResponse.json();
          
          // Update Historical Weather Section
          updateHistoricalWeather(historyData);
          
        } catch (error) {
          console.error(error.message);
        }
      }
    }
    
    //Update Historical Weather UI
    function updateHistoricalWeather(data) {
      const dayData = data.forecast.forecastday[0];
      
      const card = document.createElement('div');
      card.classList.add('forecast-card', 'historical-weather-card');
      
      card.innerHTML = `
        <div class="forecast-date">${formatDate(dayData.date)}</div>
        <div class="forecast-icon">
          <i class="fas ${getWeatherIcon(dayData.day.condition.code)}"></i>
        </div>
        <div class="forecast-temp">${currentUnit === 'C' ? dayData.day.avgtemp_c + '°C' : cToF(dayData.day.avgtemp_c) + '°F'}</div>
        <div class="forecast-description">${dayData.day.condition.text}</div>
      `;
      
      historicalWeatherGrid.appendChild(card);
    }
    
    // Toggle Dark Mode
    function toggleDarkMode(isDark) {
      document.body.classList.toggle('dark-mode', isDark);
      document.querySelectorAll('.navbar').forEach(nav => nav.classList.toggle('dark-mode', isDark));
      document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.toggle('dark-mode', isDark));
    }
    
    // Toggle Temperature Unit
    function toggleUnit(unit) {
      if (currentUnit === unit) return; // No change needed
      
      currentUnit = unit;
      // Update Current Temperature
      const tempValue = parseFloat(temperature.textContent);
      temperature.textContent = formatTemperature(tempValue);
      
      // Update Forecast Temperatures
      const forecastTemps = document.querySelectorAll('#forecast .forecast-temp');
      forecastTemps.forEach((elem, index) => {
        const tempC = parseFloat(elem.textContent);
        elem.textContent = currentUnit === 'C' ? tempC + '°C' : cToF(tempC) + '°F';
      });
      
      // Update Historical Forecast Temperatures
      const historicalTemps = document.querySelectorAll('#historical-weather .forecast-temp');
      historicalTemps.forEach((elem, index) => {
        const tempC = parseFloat(elem.textContent);
        elem.textContent = currentUnit === 'C' ? tempC + '°C' : cToF(tempC) + '°F';
      });
    }
    
    // Utility Functions c--->f
    function cToF(celsius) {
      return ((celsius * 9/5) + 32).toFixed(1);
    }
    
    function formatTemperature(temp) {
      return currentUnit === 'C' ? `${temp}°C` : `${cToF(temp)}°F`;
    }
    
    function formatDate(dateTime) {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = padZero(date.getMonth() + 1);
      const day = padZero(date.getDate());
      return `${year}-${month}-${day}`;
    }
    
    function padZero(num) {
      return num < 10 ? '0' + num : num;
    }
    
    // generate icon using condition code
    function getWeatherIcon(code) {

      if (code === 1000) return 'fa-sun'; // Sunny
      if ([1003, 1006, 1009].includes(code)) return 'fa-cloud'; // Cloudy
      if ([1030, 1063, 1066, 1069, 1072, 1087].includes(code)) return 'fa-cloud-rain'; // Rain
      if ([1135, 1147].includes(code)) return 'fa-smog'; // Fog
      if ([1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192].includes(code)) return 'fa-cloud-showers-heavy'; // Heavy Rain
      if ([1195, 1198, 1201, 1204, 1207, 1240, 1243, 1246, 1249, 1252].includes(code)) return 'fa-poo-storm'; // Storm
      if ([1273, 1276].includes(code)) return 'fa-snowflake'; // Snow
      return 'fa-question'; // Default
    }
  });
  