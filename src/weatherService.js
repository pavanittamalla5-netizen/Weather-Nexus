
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

async function request(endpoint) {
  if (!API_KEY) {
    throw new Error("API key missing. Check your .env file.");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5${endpoint}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Weather request failed");
  }

  return data;
}

export function getWeather(city) {
  return request(
    `/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
  );
}

export function getForecast(lat, lon) {
  return request(
    `/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
}

export function getAirQuality(lat, lon) {
  return request(
    `/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

