const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const message = document.getElementById("message");
const result = document.getElementById("result");

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not reach the geocoding service.");
  const data = await response.json();
  if (!data.results) throw new Error(`No city found for "${city}".`);
  return data.results[0];
}
const weatherCodes = {
  0: "Clear sky",
  1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Freezing fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Light showers", 81: "Showers", 82: "Heavy showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm"
};

function describe(code) {
  return weatherCodes[code] || "Unknown";
}

async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load the weather.");
  return response.json();
}

function showWeather(place, weather) {
  const current = weather.current;
  const daily = weather.daily;

  result.innerHTML = `
    <h2 id="place-name"></h2>
    <p class="temp">${Math.round(current.temperature_2m)}°C</p>
    <p>${describe(current.weather_code)}</p>
    <p>Humidity: ${current.relative_humidity_2m}% | Wind: ${current.wind_speed_10m} km/h</p>
    <h3>7-day forecast</h3>
    <ul id="forecast"></ul>
  `;
  document.getElementById("place-name").textContent = `${place.name}, ${place.country}`;

  const list = document.getElementById("forecast");
  daily.time.forEach((date, i) => {
    const day = new Date(date + "T00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric"
    });
    const li = document.createElement("li");
    li.textContent =
      `${day}: ${describe(daily.weather_code[i])}, ` +
      `${Math.round(daily.temperature_2m_min[i])}° / ${Math.round(daily.temperature_2m_max[i])}°C`;
    list.appendChild(li);
  });
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  message.textContent = "Searching...";
  result.textContent = "";

  try {
    const place = await getCoordinates(city);
    const weather = await getWeather(place.latitude, place.longitude);
    message.textContent = "";
    showWeather(place, weather);
  } catch (error) {
    message.textContent = error.message;
  }
});