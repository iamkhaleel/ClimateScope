import axios from "axios";
import { getHistoricalDates } from "./getHistoricalDates";

// Map variable names to Giovanni (MERRA-2) and NASA POWER parameters
const variableMap = {
  Temperature: { giovanni: "T2M", power: "T2M" }, // 2m air temperature (°C)
  Rainfall: { giovanni: "PRECTOT", power: "PRECTOTCORR" }, // Precipitation (mm/day)
  "Wind Speed": { giovanni: "WS10M", power: "WS10M" }, // 10m wind speed (m/s)
  Humidity: { giovanni: "RH2M", power: "RH2M" }, // Relative humidity at 2m (%)
  Snowfall: { giovanni: "PRECSNOLAND" }, // Snowfall (mm/day, MERRA-2 only)
  "Cloud Cover": { giovanni: "CLDTOT" }, // Total cloud fraction (0-1, MERRA-2 only)
  "Dust Concentration": { power: ["AODVIS", "AOD550", "AOD"] }, // Aerosol optical depth (POWER only)
};

// Conversion helpers
function convertValue(variable, value, unit) {
  if (value == null) return null;

  switch (variable) {
    case "Temperature":
      if (unit === "°F") return (value * 9) / 5 + 32; // °C → °F
      return value; // default °C
    case "Rainfall":
    case "Snowfall":
      if (unit === "in") return value / 25.4; // mm → inches
      return value; // default mm
    case "Wind Speed":
      if (unit === "km/h") return value * 3.6; // m/s → km/h
      if (unit === "mph") return value * 2.237; // m/s → mph
      return value; // default m/s
    case "Humidity":
      return value; // Always %, no conversion
    case "Cloud Cover":
      return value * 100; // Convert fraction (0-1) to percentage
    case "Dust Concentration":
      return value; // Dimensionless optical depth
    default:
      return value;
  }
}

// Default units
function getDefaultUnit(variable) {
  switch (variable) {
    case "Temperature":
      return "°C";
    case "Rainfall":
    case "Snowfall":
      return "mm";
    case "Wind Speed":
      return "m/s";
    case "Humidity":
    case "Cloud Cover":
      return "%";
    case "Dust Concentration":
      return "AOD";
    default:
      return "";
  }
}

export async function fetchWeatherData(
  lat,
  lon,
  date,
  variables,
  unitPrefs = {},
  years = 20
) {
  const validVars = variables.filter((v) => variableMap[v]);
  if (validVars.length === 0) return {};

  const historicalDates = getHistoricalDates(date, years);
  const start = historicalDates[0];
  const end = historicalDates[historicalDates.length - 1];
  const results = {};

  // Try Giovanni first
  const giovanniVars = validVars.filter((v) => variableMap[v].giovanni);
  if (giovanniVars.length > 0) {
    const giovanniUrl = `https://giovanni.gsfc.nasa.gov/giovanni/daac-bin/service_manager/data?service=TmAvMp&starttime=${start.slice(
      0,
      4
    )}-${start.slice(4, 6)}-${start.slice(6, 8)}&endtime=${end.slice(
      0,
      4
    )}-${end.slice(4, 6)}-${end.slice(6, 8)}&bbox=${lon - 0.1},${lat - 0.1},${
      lon + 0.1
    },${lat + 0.1}&data=${giovanniVars
      .map((v) => `MERRA2_${variableMap[v].giovanni}_M`)
      .join(",")}&format=json`;
    try {
      const response = await axios.get(giovanniUrl, {
        headers: { "User-Agent": "ClimateScopeApp/1.0 (contact@example.com)" },
      });
      const data = response.data.data || [];
      giovanniVars.forEach((v) => {
        results[v] = historicalDates.map((d) => {
          const record = data.find((r) => r.time.startsWith(d));
          const rawVal = record ? record[variableMap[v].giovanni] : null;
          const unit = unitPrefs[v] || getDefaultUnit(v);
          return convertValue(v, rawVal, unit);
        });
      });
    } catch (err) {
      console.error("Giovanni API fetch error:", err);
    }
  }

  // Fallback to NASA POWER API for variables not found or if Giovanni fails
  const missingVars = validVars.filter(
    (v) => !results[v] && variableMap[v].power
  );
  if (missingVars.length > 0) {
    const paramSet = new Set();
    missingVars.forEach((v) => {
      const key = variableMap[v].power;
      if (Array.isArray(key)) {
        key.forEach((k) => paramSet.add(k));
      } else {
        paramSet.add(key);
      }
    });
    const params = Array.from(paramSet).join(",");
    const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

    try {
      const response = await axios.get(powerUrl, {
        headers: { "User-Agent": "ClimateScopeApp/1.0 (contact@example.com)" },
      });
      const data = response.data.properties.parameter;
      missingVars.forEach((v) => {
        const mapEntry = variableMap[v].power;
        let chosen = mapEntry;
        if (Array.isArray(mapEntry)) {
          chosen = mapEntry.find((k) => data[k] != null) || mapEntry[0];
        }
        results[v] = historicalDates.map((d) => {
          const rawVal = data[chosen]?.[d] ?? null;
          const unit = unitPrefs[v] || getDefaultUnit(v);
          return convertValue(v, rawVal, unit);
        });
      });
    } catch (err) {
      console.error("NASA POWER API fetch error:", err);
    }
  }

  return results;
}
