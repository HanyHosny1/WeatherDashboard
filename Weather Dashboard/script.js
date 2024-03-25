const cityInput = document.querySelector('.city-input');
const searchButton = document.querySelector('.search-btn');
const locationButton = document.querySelector('.location-btn');
const currentWeatherDiv = document.querySelector('.current-weather');
const weatherCardsDiv = document.querySelector('.weather-cards');

const API_KEY = '9c3159737d8ad6409e13fd49b2c6f35a'; //API Key forOpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    // HTML for the maon weather card
    return `<div class="details">
              <h2>${cityName} (${weatherItem.dt_txt.split(' ')[0]})</h2>
              <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                2
              )}°C</h4>
              <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
              <h4>Humadity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
              <img
                src="https://openweathermap.org/img/wn/${
                  weatherItem.weather[0].icon
                }@4x.png"
                alt="weather"
              />
              <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
  } else {
    return `<li class="card">
              <h3>(${weatherItem.dt_txt.split(' ')[0]})</h3>
              <img
                src="https://openweathermap.org/img/wn/${
                  weatherItem.weather[0].icon
                }@2x.png"
                alt="weather"
              />
              <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
              <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
              <h4>Humadity: ${weatherItem.main.humidity}%</h4>
            </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      //Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      //Clearing the previous weather data
      cityInput.value = '';
      currentWeatherDiv.innerHTML = '';
      weatherCardsDiv.innerHTML = '';

      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML(
            'beforeend',
            createWeatherCard(cityName, weatherItem, index)
          );
        } else {
          weatherCardsDiv.insertAdjacentHTML(
            'beforeend',
            createWeatherCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch(() => {
      alert('An error occurred while fetching the weather forecast!');
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim(); //Get user enetered city name and remove extra spaces
  if (!cityName) return; //return if the name is empty

  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  //Get entered city coordinates (latitude, longitude and name) from the API response
  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert('An error occured while fetching the coordinates !');
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;

      //Get City name from coordinates using reverse geocoding API

      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert('An error occured while fetching the city!');
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          'Geolocation request denied. Please reset location permission to grant access again.'
        );
      }
    }
  );
};

locationButton.addEventListener('click', getUserCoordinates);
searchButton.addEventListener('click', getCityCoordinates);
cityInput.addEventListener(
  'keyup',
  (e) => e.key === 'Enter' && getCityCoordinates()
);
