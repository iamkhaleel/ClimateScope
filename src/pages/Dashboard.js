import { useState } from "react";
import MapSelector from "../components/MapSelector";
import DateSelector from "../components/DateSelector";
import VariableSelector from "../components/VariableSelector";
import ProbabilityChart from "../components/ProbabilityChart";
import SummaryCard from "../components/SummaryCard";
import { fetchWeatherData } from "../utils/fetchWeatherData";

// Simple probability function
function calcProbability(values, threshold) {
  if (!values || values.length === 0) return 0;
  const exceedCount = values.filter((v) => v !== null && v > threshold).length;
  return (exceedCount / values.length) * 100;
}

export default function Dashboard() {
  const [location, setLocation] = useState({ lat: 12.0, lon: 8.5 });
  const [date, setDate] = useState(new Date());
  const [variables, setVariables] = useState(["Temperature"]);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchData = async () => {
    if (!variables.length) {
      setError("Select at least one variable!");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Fetch 20 years of historical data
      const results = await fetchWeatherData(
        location.lat,
        location.lon,
        date,
        variables,
        20
      );

      // Example thresholds (can be made user-selectable)
      const thresholds = {
        Temperature: 30, // °C
        Precipitation: 10, // mm
        "Wind Speed": 5, // m/s
      };

      const probabilityData = variables.map((v) => {
        const values = results[v] || [];
        const probability = calcProbability(values, thresholds[v] || 0);
        return { variable: v, probability };
      });

      // Prepare chart-friendly format
      setData(
        probabilityData.map((d, i) => ({
          day: i + 1,
          probability: d.probability,
        }))
      );

      // Text summary
      const summaryText = probabilityData
        .map(
          (d) =>
            `Chance of ${d.variable.toLowerCase()} above ${
              thresholds[d.variable]
            }: ${d.probability.toFixed(1)}%`
        )
        .join(". ");
      setSummary(summaryText);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!data.length) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      data.map((d) => `${d.day},${d.probability}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "weather_probabilities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            ClimateScope <span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-gray-600">
            Explore extreme weather probabilities by location and date.
          </p>
        </div>

        {/* Loading and error states */}
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

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Map section */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-3 border-b">
                <h2 className="font-semibold text-gray-800">Select Location</h2>
              </div>
              <div className="h-[320px] sm:h-[420px]">
                <MapSelector setLocation={setLocation} />
              </div>
            </div>
          </div>

          {/* Controls and data section */}
          <div className="lg:col-span-5 space-y-4">
            {/* Input controls */}
            <div className="bg-white shadow rounded-lg p-4 space-y-4">
              <DateSelector date={date} setDate={setDate} />
              <VariableSelector
                variables={variables}
                setVariables={setVariables}
              />
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleFetchData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md transition"
                >
                  Fetch Data
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-md transition"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {/* Data visualization */}
            {data.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4 space-y-4">
                <ProbabilityChart data={data} />
                <SummaryCard text={summary} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
