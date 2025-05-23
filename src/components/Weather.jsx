import React, { useState } from "react"; 
import "./Weather.css";
import cloud_icon from "../assets/cloud.png";
import brokenCloudIcon from "../assets/simplecloud.png";
import clear_icon from "../assets/clear.png";
import mist_icon from "../assets/mist.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";

function Weather() {
  const [input, setInput] = useState("");
  const [weatherData, setWeatherData] = useState(false);

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": brokenCloudIcon,
    "03n": brokenCloudIcon,
    "04d": mist_icon,
    "04n": brokenCloudIcon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = {
      weekday: 'short',
      month: 'short',
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    };
    return now.toLocaleString('en-US', options);
  };

  const search = async () => {
    if (input.trim() === "") {
      alert("Please enter a city name");
      return;
    }

    try {
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${input}&appid=8ac5c4d57ba6a4b3dfcf622700447b1e&units=metric`;
      const currentResponse = await fetch(currentUrl);
      const currentData = await currentResponse.json();

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${input}&appid=8ac5c4d57ba6a4b3dfcf622700447b1e&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      if (!currentResponse.ok || !forecastResponse.ok) {
        alert(currentData.message || forecastData.message);
        return;
      }

      const iconCode = currentData.weather[0].icon;
      const icon = allIcons[iconCode] || clear_icon;

      const rainProbability = forecastData.list[0].pop * 100;

      const hourlyForecast = processHourlyForecast(forecastData.list);

      setWeatherData({
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        temperature: Math.floor(currentData.main.temp),
        feels_like: Math.floor(currentData.main.feels_like),
        windDirection: convertDegToDirection(currentData.wind.deg),
        sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        location: currentData.name,
        description: currentData.weather[0].description,
        rainProbability: Math.round(rainProbability),
        hourlyForecast,
        icon: icon,
      });
      setInput("");
    } catch (error) {
      console.log("Error fetching data", error);
      alert("Failed to fetch weather data");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  function convertDegToDirection(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  }

  const processHourlyForecast = (forecastList) => {
    return forecastList.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true }).replace(/^0/, ''),
      temp: Math.round(item.main.temp),
      icon: allIcons[item.weather[0].icon] || clear_icon,
      pop: Math.round(item.pop * 100)
    }));
  };

  return (
    <div className="weather-app">
      <div className="card">
        <div className="search" style={{ marginTop: "16px" }}>
          <input
            type="text"
            placeholder="Enter City Name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="button" className="btn custom-btn" onClick={search}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        {weatherData ? (
          <div className="weather">
            <img src={weatherData.icon} alt="" className="weather-icon" />
            <h1 className="temp">{weatherData.temperature}°c</h1>
            <h2 className="city">{weatherData.location}</h2>
            <h5>{weatherData.description}</h5>
            <h6>Feels like {weatherData.feels_like} °c</h6>

            <div className="date-time-display">
              {getCurrentDateTime()}
            </div>

            <div className="details">
              <div className="col">
                <h5>Humidity</h5>
                <i className="fas fa-tint fs-3"></i>
                <p className="humidity">{weatherData.humidity}%</p>
              </div>

              <div className="col">
                <h5>Wind direction</h5>
                <i className="ri-compass-3-line fs-3"></i>
                <p className="humidity">{weatherData.windDirection}</p>
              </div>

              <div className="col">
                <h5>Wind speed</h5>
                <i className="fas fa-wind fs-3"></i>
                <p className="humidity">{(weatherData.windSpeed * 3.6).toFixed(1)} km/h</p>
              </div>

              <div className="col">
                <h5>Chance of rain</h5>
                <i className="fas fa-cloud-rain fs-3"></i>
                <p className="humidity">{weatherData.rainProbability}%</p>
              </div>

              <div className="col">
                <h5>Sunrise & Sunset</h5>
                <i className="ri-sun-foggy-fill fs-3 "></i> | <i className="ri-sun-cloudy-fill  fs-3"></i>
                <p className="value">{weatherData.sunrise} am | {weatherData.sunset} pm</p>
              </div>
            </div>

            <div className="forecast-section">
              <h3>Hourly Forecast</h3>
              <div className="hourly-forecast">
                {weatherData.hourlyForecast.map((hour, index) => (
                  <div key={index} className="hourly-item">
                    <p className="hourly-time">{hour.time}</p>
                    <img src={hour.icon} alt="" className="forecast-icon" />
                    <p className="hourly-temp">{hour.temp}°C</p>
                    <p className="hourly-pop">{hour.pop}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="weather-placeholder">
            <p>Search for a city to see weather information</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;
