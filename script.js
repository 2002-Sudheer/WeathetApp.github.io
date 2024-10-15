const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY ='d021e8bfa939329a4217ecc38b71fa65';

// Update time and date every second
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' +
   (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`;

    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month];
}, 1000);

// Fetch weather data
getWeatherData();
function getWeatherData() {
    navigator.geolocation.getCurrentPosition(async (success) => {
        let { latitude, longitude } = success.coords;//it will take the users current location

        const temp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`)//api for the next 6 days forecast weather  data
                        .then(res => res.json());

        showWeatherData(temp);
    });
}

function showWeatherData(temp) {
    const { humidity, pressure } = temp.list[0].main;
    const wind_speed = temp.list[0].wind.speed;
    const { sunrise, sunset } = temp.city; // Corrected: Using correct sunrise and sunset data

    timezone.innerHTML = temp.city.name;
    countryEl.innerHTML = temp.city.country;

    // Format sunrise and sunset times
    const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Update current weather items
    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${wind_speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${sunriseTime}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${sunsetTime}</div>
        </div>
    `;

    // Update forecast for current and upcoming days
    let otherDayForecast = '';
    temp.list.forEach((day, idx) => {
        if (idx == 0) {
            currentTempEl.innerHTML = `
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" class="w-icon" />
                <div class="other">
                    <div class="day">${window.moment(day.dt * 1000).format('dddd')}</div>
                    <div>${day.dt_txt}</div>
                    <div>${day.main.temp}&deg;C</div>
                </div>
            `;
        } else if (idx % 8 === 0) { // Show forecast once per day (assuming 3-hour intervals, 8 data points per day)
            otherDayForecast += `
                <div class="weather-forecast-item">
                    <div class="day">${window.moment(day.dt * 1000).format('ddd')}</div>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" class="w-icon" />
                    <div>${day.dt_txt}</div>
                    <div>${day.main.temp}&deg;C</div>
                </div>
            `;
        }
    });

    weatherForecastEl.innerHTML = otherDayForecast;
}
