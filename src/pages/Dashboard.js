import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MapSelector from "../components/MapSelector";
import DateSelector from "../components/DateSelector";
import VariableSelector from "../components/VariableSelector";
import ProbabilityChart from "../components/ProbabilityChart";
import SummaryCard from "../components/SummaryCard";
import LocationSearch from "../components/LocationSearch";
import ActivitySuggestions from "../components/ActivitySuggestions";
import WeatherAnimations from "../components/WeatherAnimations";
import { fetchWeatherData } from "../utils/fetchWeatherData";
import { saveAs } from "file-saver";
import {
  FaCalendarAlt,
  FaChartBar,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaRedo,
  FaDownload,
  FaWind,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

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
  const navigate = useNavigate();
  const [location, setLocation] = useState({
    lat: 12.0,
    lon: 8.5,
    name: "Default",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState(new Date());
  const [variables, setVariables] = useState(["Temperature"]);
  const [data, setData] = useState([]);
  const [mostLikely, setMostLikely] = useState({});
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showWeatherAnimation, setShowWeatherAnimation] = useState(false);
  const [thresholds, setThresholds] = useState(
    variables.reduce(
      (acc, v) => ({ ...acc, [v]: { value: 0, unit: unitOptions[v][0] } }),
      {}
    )
  );

  useEffect(() => {
    setThresholds((prev) => {
      const newTh = { ...prev };
      variables.forEach((v) => {
        if (!newTh[v]) newTh[v] = { value: 0, unit: unitOptions[v][0] };
      });
      Object.keys(newTh).forEach((k) => {
        if (!variables.includes(k)) delete newTh[k];
      });
      return newTh;
    });
  }, [variables]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    setSearchQuery(location.name || "");
  }, [location.name]);

  const handleFetchData = async () => {
    if (variables.length === 0) {
      setError("Select at least one variable.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const baseThresholds = {};
      variables.forEach((v) => {
        baseThresholds[v] = convertToBase(
          v,
          thresholds[v]?.value || 0,
          thresholds[v]?.unit || unitOptions[v][0]
        );
      });
      const results = await fetchWeatherData(
        location.lat,
        location.lon,
        date,
        variables,
        baseThresholds
      );
      const processedData = variables.map((v) => {
        const values = results[v] || [];
        const probability = calcProbability(values, baseThresholds[v]);
        const average = calcMostLikely(values);
        return {
          variable: v,
          probability,
          average,
          count: values.length,
          values,
        };
      });
      setData(processedData);
      setMostLikely(
        variables.reduce(
          (acc, v) => ({ ...acc, [v]: calcMostLikely(results[v] || []) }),
          {}
        )
      );
      const summaryText = processedData
        .map((d) => {
          const t = thresholds[d.variable];
          return `Chance of ${d.variable.toLowerCase()} above ${t.value}${
            t.unit
          }: ${d.probability.toFixed(1)}%`;
        })
        .join(". ");
      setSummary(summaryText);

      // Trigger weather animation after successful data fetch
      setShowWeatherAnimation(true);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVariables(["Temperature"]);
    setDate(new Date());
    setLocation({ lat: 12.0, lon: 8.5, name: "Default" });
    setSearchQuery("");
    setData([]);
    setMostLikely({});
    setSummary("");
    setError(null);
    setShowWeatherAnimation(false);
  };

  const handleAnimationComplete = () => {
    setShowWeatherAnimation(false);
  };

  const handleAirQualityCheck = () => {
    navigate("/air-quality");
  };

  const handleDownloadCSV = () => {
    // Ensure date is a proper Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    const dateString = dateObj.toISOString().split("T")[0];

    const csvContent = [
      [
        "Variable",
        "Probability (%)",
        "Average",
        "Unit",
        "Count",
        "Historical Values",
      ],
      ...data.map((d) => [
        d.variable,
        d.probability.toFixed(2),
        d.average?.toFixed(2) || "N/A",
        thresholds[d.variable]?.unit || unitOptions[d.variable][0],
        d.count,
        d.values.map((v) => (v != null ? v.toFixed(2) : "N/A")).join(";"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const metadata = [
      `Source: Giovanni Nasa`,
      `Location: ${location.name || "Unknown"} (${location.lat.toFixed(
        2
      )}, ${location.lon.toFixed(2)})`,
      `Date: ${dateString}`,
      `Variables: ${variables.join(", ")}`,
      `Generated: ${new Date().toISOString()}`,
      "",
    ].join("\n");
    const blob = new Blob([`${metadata}\n${csvContent}`], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(
      blob,
      `WeatherData_${
        location.name.replace(/\s+/g, "_") || "data"
      }_${dateString}.csv`
    );
  };

  const handleDownloadJSON = () => {
    // Ensure date is a proper Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    const dateString = dateObj.toISOString().split("T")[0];

    const jsonData = {
      metadata: {
        source: "Weather Data API",
        location: {
          name: location.name || "Unknown",
          lat: location.lat,
          lon: location.lon,
        },
        date: dateString,
        variables: variables,
        generated: new Date().toISOString(),
      },
      data: data.map((d) => ({
        variable: d.variable,
        probability: d.probability,
        average: d.average,
        unit: thresholds[d.variable]?.unit || unitOptions[d.variable][0],
        count: d.count,
        values: d.values,
      })),
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    saveAs(
      blob,
      `WeatherData_${
        location.name.replace(/\s+/g, "_") || "data"
      }_${dateString}.json`
    );
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-teal-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 transition-colors duration-300`}
    >
      {/* Top Navigation */}
      <nav className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4">
        <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
          <FaChartBar /> ClimateScope
        </h1>
        <div className="flex items-center gap-4">
          {/* <FaUserCircle className="text-3xl text-purple-600 dark:text-purple-400" /> */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:sticky md:top-20 col-span-1 space-y-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-teal-200 dark:border-teal-700"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <FaCalendarAlt /> Controls
            </h2>
            <DateSelector date={date} setDate={setDate} />
            <VariableSelector
              variables={variables}
              setVariables={setVariables}
            />
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-purple-600 dark:text-purple-400">
                Thresholds
              </h3>
              {variables.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-2 mb-3 relative group"
                >
                  <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {v}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={thresholds[v]?.value || 0}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        [v]: {
                          ...thresholds[v],
                          value: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={thresholds[v]?.unit}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        [v]: { ...thresholds[v], unit: e.target.value },
                      })
                    }
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {unitOptions[v].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFetchData}
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            {isLoading ? <FaSyncAlt className="animate-spin" /> : null}
            {isLoading ? "Fetching..." : "Fetch Data"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleReset}
            className="w-full py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            <FaRedo /> Reset
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAirQualityCheck}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            <FaWind /> Air Quality Check
          </motion.button>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}
        </motion.aside>

        {/* Main Content */}
        <main className="col-span-1 md:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-teal-200 dark:border-teal-700"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <FaMapMarkerAlt /> Location
            </h2>
            <LocationSearch
              onLocationSelect={(loc) => {
                setLocation({ lat: loc.lat, lon: loc.lon, name: loc.name });
                setSearchQuery(loc.name);
              }}
              value={location?.name || searchQuery}
            />
            {location?.name && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                📍 {location.name} (Lat: {location.lat.toFixed(2)}, Lon:{" "}
                {location.lon.toFixed(2)})
              </p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {data.length === 0 ? (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-teal-200 dark:border-teal-700"
              >
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">
                  Select Location on Map
                </h3>
                <div className="h-96 rounded-md overflow-hidden shadow-inner">
                  <MapSelector
                    setLocation={(loc) => {
                      setLocation(loc);
                      setSearchQuery(loc.name);
                    }}
                    location={location}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-teal-200 dark:border-teal-700"
              >
                <div className="flex gap-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadCSV}
                    className="py-2 px-4 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition flex items-center gap-2"
                  >
                    <FaDownload /> Download CSV
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadJSON}
                    className="py-2 px-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    <FaDownload /> Download JSON
                  </motion.button>
                </div>

                <Tabs>
                  <TabList className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <Tab className="px-4 py-2 cursor-pointer text-purple-600 dark:text-purple-400 hover:bg-teal-100 dark:hover:bg-gray-700 rounded-t-md">
                      Charts
                    </Tab>
                    <Tab className="px-4 py-2 cursor-pointer text-purple-600 dark:text-purple-400 hover:bg-teal-100 dark:hover:bg-gray-700 rounded-t-md">
                      Summary
                    </Tab>
                    <Tab className="px-4 py-2 cursor-pointer text-purple-600 dark:text-purple-400 hover:bg-teal-100 dark:hover:bg-gray-700 rounded-t-md">
                      Suggestions
                    </Tab>
                  </TabList>

                  <TabPanel>
                    <ProbabilityChart data={data} />
                  </TabPanel>
                  <TabPanel>
                    <SummaryCard text={summary} />
                  </TabPanel>
                  <TabPanel>
                    <ActivitySuggestions
                      mostLikely={mostLikely}
                      location={location}
                      date={date}
                    />
                  </TabPanel>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2025 ClimateScopeApp. Powered by ClimateScopeTeam.
      </footer>

      {/* Weather Animations */}
      <WeatherAnimations
        weatherData={mostLikely}
        showAnimation={showWeatherAnimation}
        onAnimationComplete={handleAnimationComplete}
      />
    </div>
  );
}
