// src/pages/Dashboard.js
import { useState } from "react";
import MapSelector from "../components/MapSelector";
import DateSelector from "../components/DateSelector";
import VariableSelector from "../components/VariableSelector";
import ProbabilityChart from "../components/ProbabilityChart";
import SummaryCard from "../components/SummaryCard";
import LocationSearch from "../components/LocationSearch";
import { fetchWeatherData } from "../utils/fetchWeatherData";
import ActivitySuggestions from "../components/ActivitySuggestions";

// -------------------- UNITS --------------------
const unitOptions = {
  Temperature: ["°C", "°F"],
  Rainfall: ["mm", "in"],
  "Wind Speed": ["m/s", "km/h", "mph"],
  Humidity: ["%"],
  "Dust Concentration": ["AOD"],
};

// -------------------- UNIT CONVERSIONS --------------------
function convertToBase(variable, value, unit) {
  if (value == null || isNaN(value)) return value;

  switch (variable) {
    case "Temperature":
      return unit === "°F" ? ((value - 32) * 5) / 9 : value;
    case "Rainfall":
      return unit === "in" ? value * 25.4 : value;
    case "Wind Speed":
      if (unit === "km/h") return value / 3.6;
      if (unit === "mph") return value * 0.44704;
      return value;
    default:
      return value;
  }
}

function calcProbability(values, thresholdValue) {
  const clean = values.filter((v) => v !== null && !isNaN(v));
  if (!clean.length) return 0;
  const exceed = clean.filter((v) => v > thresholdValue).length;
  return (exceed / clean.length) * 100;
}

function calcMostLikely(values) {
  const clean = values.filter((v) => v !== null && !isNaN(v));
  if (!clean.length) return null;
  const avg = clean.reduce((a, b) => a + b, 0) / clean.length;
  return avg;
}

export default function Dashboard() {
  const [location, setLocation] = useState({
    lat: 12.0,
    lon: 8.5,
    name: "Default",
  });
  const [date, setDate] = useState(new Date());
  const [variables, setVariables] = useState(["Temperature"]);
  const [data, setData] = useState([]);
  const [mostLikely, setMostLikely] = useState({});
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [thresholds, setThresholds] = useState({
    Temperature: { value: 30, unit: "°C" },
    Rainfall: { value: 10, unit: "mm" },
    "Wind Speed": { value: 5, unit: "m/s" },
    Humidity: { value: 70, unit: "%" },
    "Dust Concentration": { value: 0.3, unit: "AOD" },
  });

  const handleFetchData = async () => {
    if (!variables.length) {
      setError("Select at least one variable!");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchWeatherData(
        location.lat,
        location.lon,
        date,
        variables,
        20
      );

      const probabilityData = variables.map((v) => {
        const values = results[v] || [];
        const thresholdBase = convertToBase(
          v,
          thresholds[v]?.value,
          thresholds[v]?.unit
        );
        const probability = calcProbability(values, thresholdBase);
        return { variable: v, probability, values };
      });

      setData(probabilityData);

      // --- Calculate most likely values ---
      const mostLikelyData = {};
      variables.forEach((v) => {
        mostLikelyData[v] = calcMostLikely(results[v] || []);
      });
      setMostLikely(mostLikelyData);

      // build summary text
      const summaryText = probabilityData
        .map((d) => {
          const t = thresholds[d.variable];
          return `Chance of ${d.variable.toLowerCase()} above ${t.value}${
            t.unit
          }: ${d.probability.toFixed(1)}%`;
        })
        .join(". ");
      setSummary(summaryText);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Climate <span className="text-blue-600">Scope</span>
          </h1>
          <p className="text-gray-600">
            Explore extreme weather probabilities by location and date.
          </p>
        </div>

        {/* Loading & errors */}
        {isLoading && (
          <div className="text-center py-4 bg-blue-50 rounded-lg mb-4">
            <p className="text-blue-600">Loading data...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-4 bg-red-50 rounded-lg mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Map */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-3 border-b">
                <h2 className="font-semibold text-gray-800">Select Location</h2>
              </div>
              <div className="h-[320px] sm:h-[420px]">
                <MapSelector setLocation={setLocation} location={location} />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white shadow rounded-lg p-4 space-y-4">
              <DateSelector date={date} setDate={setDate} />
              <VariableSelector
                variables={variables}
                setVariables={setVariables}
                available={[
                  "Temperature",
                  "Rainfall",
                  "Wind Speed",
                  "Humidity",
                  "Dust Concentration",
                ]}
              />

              {/* Thresholds */}
              {variables.map((v) => (
                <div key={v} className="flex items-center gap-2 flex-wrap">
                  <label className="text-sm font-medium">{v} Threshold:</label>
                  <input
                    type="number"
                    value={thresholds[v]?.value ?? 0}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        [v]: {
                          ...thresholds[v],
                          value: Number(e.target.value),
                        },
                      })
                    }
                    className="w-24 border rounded px-2 py-1 text-sm"
                  />
                  <select
                    value={thresholds[v]?.unit}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        [v]: { ...thresholds[v], unit: e.target.value },
                      })
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {unitOptions[v].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleFetchData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                >
                  Fetch Data
                </button>
              </div>
            </div>

            {/* Location search */}
            <div className="p-3 border-b relative">
              <LocationSearch
                onLocationSelect={(loc) =>
                  setLocation({ lat: loc.lat, lon: loc.lon, name: loc.name })
                }
              />
              {location?.name && (
                <p className="mt-2 text-sm text-gray-600">
                  📍 {location.name} (Lat: {location.lat}, Lon: {location.lon})
                </p>
              )}
            </div>

            {/* Results */}
            {data.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4 space-y-4">
                <ProbabilityChart data={data} />
                <SummaryCard text={summary} />
                <ActivitySuggestions
                  mostLikely={mostLikely}
                  location={location}
                  date={date}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
