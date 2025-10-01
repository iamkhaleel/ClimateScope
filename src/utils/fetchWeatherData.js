import axios from "axios";

export async function fetchWeatherData(lat, lon, date, variables) {
  // Map variable names to NASA POWER parameters
  const variableMap = {
    Temperature: "T2M",
    Precipitation: "PRECTOT",
    "Wind Speed": "WS10M",
  };

  const params = variables.map((v) => variableMap[v]).join(",");

  const yyyymmdd = date.replaceAll("-", ""); // format date as YYYYMMDD

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=AG&longitude=${lon}&latitude=${lat}&start=${yyyymmdd}&end=${yyyymmdd}&format=JSON`;

  try {
    const response = await axios.get(url);
    const data = response.data.properties.parameter;

    // data will look like { T2M: { '20250715': 35 }, PRECTOT: { '20250715': 5 }, ... }
    const result = variables.map((v) => {
      const param = variableMap[v];
      const value = data[param][yyyymmdd];
      return { variable: v, value: value };
    });

    return result;
  } catch (err) {
    console.error("NASA API fetch error:", err);
    return variables.map((v) => ({ variable: v, value: null }));
  }
}
