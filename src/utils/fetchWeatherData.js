import axios from "axios";

// Map variable names to NASA POWER parameters
// For Dust, include multiple candidate keys and select the first present in response
const variableMap = {
  Temperature: "T2M", // 2m air temperature (°C)
  Rainfall: "PRECTOTCORR", // Precipitation (mm/day)
  "Wind Speed": "WS10M", // 10m wind speed (m/s)
  Humidity: "RH2M", // Relative humidity at 2m (%)
  "Dust Concentration": ["AODVIS", "AOD550", "AOD"], // Candidate AOD keys
};

// Conversion helpers
function convertValue(variable, value, unit) {
  if (value == null) return null;

  switch (variable) {
    case "Temperature":
      if (unit === "F") return (value * 9) / 5 + 32; // °C → °F
      return value; // default °C

    case "Rainfall":
      if (unit === "in") return value / 25.4; // mm → inches
      return value; // default mm

    case "Wind Speed":
      if (unit === "km/h") return value * 3.6; // m/s → km/h
      if (unit === "mph") return value * 2.237; // m/s → mph
      return value; // default m/s

    case "Humidity":
      return value; // Always %, no conversion

    case "Dust Concentration":
      return value; // stays as-is (dimensionless optical depth)

    default:
      return value;
  }
}

// Generate YYYYMMDD dates for the same day over past N years
function getHistoricalDates(selectedDate, years = 20) {
  const date = new Date(selectedDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const currentYear = date.getFullYear();

  const historicalDates = [];
  for (let y = currentYear - years; y < currentYear; y++) {
    const yyyy = y;
    const mm = month.toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    historicalDates.push(`${yyyy}${mm}${dd}`);
  }
  return historicalDates;
}

// Fetch historical multi-year weather data
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

  // Build parameter list
  const paramSet = new Set();
  validVars.forEach((v) => {
    const key = variableMap[v];
    if (Array.isArray(key)) {
      key.forEach((k) => paramSet.add(k));
    } else {
      paramSet.add(key);
    }
  });
  const params = Array.from(paramSet).join(",");
  const historicalDates = getHistoricalDates(date, years);

  const start = historicalDates[0];
  const end = historicalDates[historicalDates.length - 1];

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

  try {
    const response = await axios.get(url);
    const data = response.data.properties.parameter;

    const results = {};
    validVars.forEach((v) => {
      const mapEntry = variableMap[v];
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

    return results;
  } catch (err) {
    console.error("NASA API fetch error:", err);
    return {};
  }
}

// Default units
function getDefaultUnit(variable) {
  switch (variable) {
    case "Temperature":
      return "C"; // Celsius
    case "Rainfall":
      return "mm"; // Millimeters
    case "Wind Speed":
      return "m/s"; // Meters per second
    case "Humidity":
      return "%"; // Percentage
    default:
      return "";
  }
}
