import axios from "axios";

// Map variable names to NASA POWER parameters
const variableMap = {
  Temperature: "T2M", // Near-surface air temp (°C)
  Precipitation: "PRECTOT", // Daily precipitation (mm/day)
  "Wind Speed": "WS10M", // Wind speed at 10m (m/s)
};

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
export async function fetchWeatherData(lat, lon, date, variables, years = 20) {
  const params = variables.map((v) => variableMap[v]).join(",");
  const historicalDates = getHistoricalDates(date, years);

  const start = historicalDates[0];
  const end = historicalDates[historicalDates.length - 1];

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

  try {
    const response = await axios.get(url);
    const data = response.data.properties.parameter;

    // Organize results into per-variable arrays and clean nulls
    const results = {};
    variables.forEach((v) => {
      const param = variableMap[v];
      const rawValues = historicalDates.map((d) => data[param]?.[d] ?? null);
      // remove null / NaN values
      results[v] = rawValues.filter((val) => val !== null && !isNaN(val));
    });

    return results;
  } catch (err) {
    console.error("NASA API fetch error:", err);
    return {};
  }
}
