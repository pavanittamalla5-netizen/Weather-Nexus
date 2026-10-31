
import { useEffect, useState } from "react";

import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  CloudFog,
  LoaderCircle,
  RefreshCw,
  Activity,
} from "lucide-react";

import {
  getWeather,
  getForecast,
  getAirQuality,
} from "./weatherService.js";


// Select weather icon
function getWeatherIcon(condition) {
  const value = condition?.toLowerCase() || "";

  if (value.includes("thunder")) return CloudLightning;
  if (value.includes("rain") || value.includes("drizzle")) return CloudRain;
  if (value.includes("cloud")) return Cloud;

  if (
    value.includes("mist") ||
    value.includes("fog") ||
    value.includes("haze")
  ) {
    return CloudFog;
  }

  if (value.includes("clear")) return Sun;

  return Cloud;
}


// Main App
function App() {
  const [city, setCity] = useState("Hyderabad");
  const [search, setSearch] = useState("");

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // Weather background images
  const backgroundImages = {
    sunny: "/images/Sunny.jpg",
    rain: "/images/rainy.jpg",
    cloudy: "/images/cloudy.jpg",
    storm: "/images/strom.jpg",
    night: "/images/night.jpg",
    snow: "/images/snow.jpg",
  };


  // Load weather information
  async function loadWeather(cityName) {
    setLoading(true);
    setError("");

    try {
      const current = await getWeather(cityName);

      setWeather(current);
      setCity(current.name);

      const [forecastResult, aqiResult] =
        await Promise.allSettled([
          getForecast(
            current.coord.lat,
            current.coord.lon
          ),
          getAirQuality(
            current.coord.lat,
            current.coord.lon
          ),
        ]);


      // Forecast processing
      if (forecastResult.status === "fulfilled") {
        const entries = forecastResult.value.list || [];
        const daily = {};

        entries.forEach((item) => {
          const date = item.dt_txt.split(" ")[0];

          if (
            !daily[date] ||
            item.dt_txt.includes("12:00:00")
          ) {
            daily[date] = item;
          }
        });

        setForecast(
          Object.values(daily).slice(0, 5)
        );
      } else {
        setForecast([]);
      }


      // Air quality processing
      if (aqiResult.status === "fulfilled") {
        setAqi(aqiResult.value.list?.[0] || null);
      } else {
        setAqi(null);
      }

    } catch (err) {
      setError(err.message || "Unable to load weather.");
      setWeather(null);
      setForecast([]);
      setAqi(null);

    } finally {
      setLoading(false);
    }
  }


  // Initial weather load
  useEffect(() => {
    loadWeather("Hyderabad");
  }, []);


  // Current weather condition
  const condition =
    weather?.weather?.[0]?.main || "Clear";


  // Local time at selected city
  const localHour = weather
    ? new Date(
        (weather.dt + weather.timezone) * 1000
      ).getUTCHours()
    : 12;

  const isNight = localHour < 6 || localHour >= 18;


  // Select background scene
  let scene = "sunny";

  if (condition === "Thunderstorm") {
    scene = "storm";
  } else if (
    condition === "Rain" ||
    condition === "Drizzle"
  ) {
    scene = "rain";
  } else if (condition === "Snow") {
    scene = "snow";
  } else if (
    condition === "Clouds" ||
    condition === "Mist" ||
    condition === "Haze" ||
    condition === "Fog"
  ) {
    scene = "cloudy";
  } else if (isNight) {
    scene = "night";
  }


  const WeatherIcon = getWeatherIcon(condition);


  // AQI scale
  const aqiInfo = {
    1: { label: "Good", color: "#35e6a0" },
    2: { label: "Fair", color: "#b7e75b" },
    3: { label: "Moderate", color: "#ffd166" },
    4: { label: "Poor", color: "#ff925c" },
    5: { label: "Very Poor", color: "#ff5e78" },
  };

  const aqiValue = aqi?.main?.aqi;
  const aqiStatus = aqiInfo[aqiValue];


  // Format sunrise and sunset
  function formatTime(timestamp) {
    if (!weather || !timestamp) return "--";

    return new Date(
      (timestamp + weather.timezone) * 1000
    ).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  }


  // Search city
  function handleSearch(event) {
    event.preventDefault();

    if (search.trim()) {
      loadWeather(search.trim());
      setSearch("");
    }
  }


  return (
    <main className="weather-app min-h-screen relative overflow-hidden bg-slate-950 text-white">

      {/* Background */}
      <div
        key={scene}
        className="weather-background"
        style={{
          backgroundImage: `url("${backgroundImages[scene]}")`,
        }}
      />

      {/* Dark overlay */}
      <div className="weather-overlay" />


      {/* Weather animations */}
      <div className="weather-effects">

        {/* Moving clouds */}
        {(scene === "cloudy" ||
          scene === "rain" ||
          scene === "storm") && (
          <>
            <div className="cloud-layer cloud-one" />
            <div className="cloud-layer cloud-two" />
            <div className="cloud-layer cloud-three" />
          </>
        )}


        {/* Rain animation */}
        {(scene === "rain" || scene === "storm") && (
          <>
            <div className="rain-layer rain-back" />
            <div className="rain-layer rain-middle" />
            <div className="rain-layer rain-front" />
          </>
        )}


        {/* Lightning */}
        {scene === "storm" && (
          <>
            <div className="lightning-flash" />
            <div className="lightning-flash lightning-second" />
          </>
        )}


        {/* Sun glow */}
        {scene === "sunny" && (
          <div className="sun-glow" />
        )}


        {/* Night stars */}
        {scene === "night" && (
          <div className="night-stars" />
        )}

      </div>


      {/* Dashboard */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 py-7">

        {/* HEADER */}
        <header className="flex justify-between items-center">

          <div className="flex items-center gap-3">

            {/* CUSTOM WEATHER NEXUS LOGO */}
            <img
              src="/wn-logo.png"
              alt="Weather Nexus Logo"
              className="w-12 h-12 rounded-xl object-contain"
            />

            <div>
              <h1 className="font-bold tracking-[3px] text-lg">
                WEATHER NEXUS
              </h1>

              <p className="text-[9px] tracking-[3px] text-white/60">
                ATMOSPHERIC INTELLIGENCE
              </p>
            </div>

          </div>


          <div className="flex items-center gap-4">

            <span className="hidden sm:flex items-center gap-2 text-xs text-green-200">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              LIVE SYSTEM
            </span>

            <button
              onClick={() => loadWeather(city)}
              disabled={loading}
              className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
              title="Refresh weather"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
            </button>

          </div>

        </header>


        {/* SEARCH */}
        <section className="mt-14 max-w-xl">

          <p className="text-xs tracking-[4px] text-amber-200 mb-4">
            YOUR WORLD, IN REAL TIME
          </p>

          <form
            onSubmit={handleSearch}
            className="flex items-center gap-3 p-2 pl-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl"
          >

            <MapPin size={19} className="text-amber-200" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a city..."
              className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder:text-white/50 py-2"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-200 text-slate-900 font-bold text-sm hover:bg-amber-100 transition disabled:opacity-50"
            >
              <Search size={17} />
              Explore
            </button>

          </form>

        </section>


        {/* LOADING */}
        {loading && !weather && (
          <div className="h-72 flex flex-col items-center justify-center gap-4">

            <LoaderCircle
              className="animate-spin text-amber-200"
              size={38}
            />

            <p className="text-white/70">
              Reading atmospheric conditions...
            </p>

          </div>
        )}


        {/* ERROR */}
        {error && (
          <div className="mt-8 p-5 rounded-xl bg-red-500/20 border border-red-300/30">

            <p>{error}</p>

            <button
              onClick={() => loadWeather(city)}
              className="mt-3 underline text-amber-200"
            >
              Try again
            </button>

          </div>
        )}


        {weather && (
          <>

            {/* CURRENT WEATHER */}
            <section className="min-h-[330px] flex flex-col md:flex-row justify-between items-center py-10 gap-8">

              <div>

                <p className="flex items-center gap-2 text-amber-200">
                  <MapPin size={16} />
                  {weather.name}, {weather.sys.country}
                </p>

                <p className="text-white/60 text-sm mt-2">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>


                <div className="flex items-center gap-6 mt-2">

                  <h2 className="text-[110px] md:text-[145px] leading-none font-light tracking-tighter">
                    {Math.round(weather.main.temp)}°
                  </h2>

                  <WeatherIcon
                    size={85}
                    strokeWidth={1.2}
                    className="text-amber-200 weather-icon"
                  />

                </div>


                <h3 className="text-3xl capitalize font-medium">
                  {weather.weather[0].description}
                </h3>

                <p className="mt-3 text-white/70 text-sm">
                  Feels like {Math.round(weather.main.feels_like)}°C
                  {" · "}H: {Math.round(weather.main.temp_max)}°
                  {" / "}L: {Math.round(weather.main.temp_min)}°
                </p>

              </div>


              <div className="hidden md:flex flex-col border-l border-white/30 pl-8 gap-3">

                <span className="text-xs tracking-widest text-amber-200">
                  ATMOSPHERIC STATUS
                </span>

                <strong className="text-2xl tracking-wider">
                  {condition.toUpperCase()}
                </strong>

                <span className="text-white/60 text-xs">
                  Live conditions detected
                </span>

              </div>

            </section>


            {/* WEATHER METRICS */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              <Metric
                icon={Droplets}
                label="Humidity"
                value={`${weather.main.humidity}%`}
              />

              <Metric
                icon={Wind}
                label="Wind speed"
                value={`${weather.wind.speed} m/s`}
              />

              <Metric
                icon={Gauge}
                label="Pressure"
                value={`${weather.main.pressure} hPa`}
              />

              <Metric
                icon={Eye}
                label="Visibility"
                value={`${(weather.visibility / 1000).toFixed(1)} km`}
              />

            </section>


            {/* FORECAST AND SUN CYCLE */}
            <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5">

              <Panel
                title="5-DAY FORECAST"
                subtitle="The days ahead"
              >

                <div className="mt-5 space-y-1">

                  {forecast.map((item) => {
                    const Icon = getWeatherIcon(
                      item.weather[0].main
                    );

                    return (
                      <div
                        key={item.dt}
                        className="grid grid-cols-[50px_35px_1fr_40px] items-center gap-3 py-3 border-b border-white/10 last:border-0"
                      >

                        <span className="text-sm text-white/70">
                          {new Date(item.dt * 1000).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              timeZone: "UTC",
                            }
                          )}
                        </span>

                        <Icon className="text-amber-200" size={23} />

                        <span className="text-sm text-white/70">
                          {item.weather[0].main}
                        </span>

                        <strong className="text-right text-lg">
                          {Math.round(item.main.temp)}°
                        </strong>

                      </div>
                    );
                  })}

                  {forecast.length === 0 && (
                    <p className="text-white/50 text-sm py-4">
                      Forecast data unavailable.
                    </p>
                  )}

                </div>

              </Panel>


              {/* SUNRISE AND SUNSET */}
              <Panel
                title="SUN CYCLE"
                subtitle="Daylight intelligence"
              >

                <div className="space-y-7 mt-7">

                  <SunTime
                    icon={Sunrise}
                    label="Sunrise"
                    value={formatTime(weather.sys.sunrise)}
                  />

                  <div className="h-px bg-gradient-to-r from-amber-200/60 to-transparent" />

                  <SunTime
                    icon={Sunset}
                    label="Sunset"
                    value={formatTime(weather.sys.sunset)}
                  />

                </div>

              </Panel>

            </section>


            {/* AIR QUALITY */}
            <section className="mt-5">

              <Panel
                title="AIR QUALITY INDEX"
                subtitle="Atmospheric health monitor"
              >

                {aqiStatus ? (
                  <>

                    <div className="flex items-center gap-6 mt-6">

                      <div
                        className="text-6xl font-bold"
                        style={{ color: aqiStatus.color }}
                      >
                        {aqiValue}
                        <span className="text-xl text-white/50">/5</span>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold">
                          {aqiStatus.label}
                        </h3>

                        <p className="text-xs text-white/60 mt-1">
                          OpenWeather air pollution index
                        </p>
                      </div>

                    </div>


                    <div className="flex gap-2 mt-5">

                      {[1, 2, 3, 4, 5].map((number) => (
                        <div
                          key={number}
                          className="h-2 flex-1 rounded-full"
                          style={{
                            background:
                              number <= aqiValue
                                ? aqiInfo[number].color
                                : "rgba(255,255,255,.15)",
                          }}
                        />
                      ))}

                    </div>


                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">

                      {[
                        ["PM2.5", aqi.components.pm2_5],
                        ["PM10", aqi.components.pm10],
                        ["NO₂", aqi.components.no2],
                        ["O₃", aqi.components.o3],
                      ].map(([name, value]) => (

                        <div
                          key={name}
                          className="p-4 rounded-xl bg-white/5"
                        >

                          <p className="text-xs text-white/50">
                            {name}
                          </p>

                          <strong className="block mt-2">
                            {Number(value).toFixed(1)} µg/m³
                          </strong>

                        </div>

                      ))}

                    </div>


                    <p className="text-[10px] text-white/50 mt-4">
                      OpenWeather AQI scale: 1–5.
                      This is not the Indian CPCB 0–500 scale.
                    </p>

                  </>
                ) : (
                  <p className="mt-5 text-white/60 text-sm">
                    Air quality data is unavailable.
                  </p>
                )}

              </Panel>

            </section>


            {/* WEATHER MAP */}
            <section className="mt-5">

              <Panel
                title="WEATHER LOCATION MAP"
                subtitle="Explore the surrounding region"
              >

                <div className="h-[300px] mt-5 overflow-hidden rounded-xl border border-white/20">

                  <iframe
                    title="Weather location map"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    className="border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${weather.coord.lon - 0.15}%2C${weather.coord.lat - 0.10}%2C${weather.coord.lon + 0.15}%2C${weather.coord.lat + 0.10}&layer=mapnik&marker=${weather.coord.lat}%2C${weather.coord.lon}`}
                  />

                </div>

                <p className="flex items-center gap-2 mt-3 text-xs text-white/60">
                  <MapPin size={14} />
                  {weather.name} · {weather.coord.lat.toFixed(3)}, {weather.coord.lon.toFixed(3)}
                </p>

              </Panel>

            </section>

          </>
        )}


        {/* FOOTER */}
        <footer className="flex flex-wrap justify-between gap-4 text-[9px] tracking-widest text-white/50 border-t border-white/20 mt-10 pt-6 pb-3">

          <span>WEATHER NEXUS</span>
          <span>POWERED BY OPENWEATHER</span>
          <span>ATMOSPHERIC INTELLIGENCE</span>

        </footer>

      </div>

    </main>
  );
}


// Metric card
function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl hover:bg-white/20 hover:-translate-y-1 transition duration-300">

      <Icon
        className="text-amber-200 shrink-0"
        size={24}
      />

      <div>
        <p className="text-xs text-white/60">
          {label}
        </p>

        <strong className="block mt-1 text-lg">
          {value}
        </strong>
      </div>

    </div>
  );
}


// Reusable panel
function Panel({ title, subtitle, children }) {
  return (
    <div className="p-5 md:p-6 rounded-3xl bg-slate-950/40 border border-white/20 backdrop-blur-2xl shadow-2xl">

      <h3 className="text-sm tracking-[2px] font-semibold">
        {title}
      </h3>

      <p className="text-xs text-white/50 mt-1">
        {subtitle}
      </p>

      {children}

    </div>
  );
}


// Sunrise and sunset
function SunTime({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">

      <div className="p-3 rounded-xl bg-white/10 text-amber-200">
        <Icon size={28} />
      </div>

      <div>
        <p className="text-xs text-white/60">
          {label}
        </p>

        <strong className="text-2xl block mt-1">
          {value}
        </strong>
      </div>

    </div>
  );
}


export default App;
