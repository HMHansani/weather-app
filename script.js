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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  message.textContent = "Searching...";
  result.textContent = "";

  try {
    const place = await getCoordinates(city);
    message.textContent = "";
    result.textContent = `${place.name}, ${place.country} (${place.latitude}, ${place.longitude})`;
  } catch (error) {
    message.textContent = error.message;
  }
});