import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaArrowLeft,
  FaWind,
  FaCloud,
  FaSun,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import LocationSearch from "../components/LocationSearch";
import AirQualityMap from "../components/AirQualityMap";
import { fetchAirQualityData } from "../utils/fetchAirQualityData";

// AQI color scheme based on EPA standards
const AQI_COLORS = {
  good: { color: "#00E400", bg: "#00E400", text: "#000000", label: "Good" },
  moderate: {
    color: "#FFFF00",
    bg: "#FFFF00",
    text: "#000000",
    label: "Moderate",
  },
  unhealthySensitive: {
    color: "#FF7E00",
    bg: "#FF7E00",
    text: "#FFFFFF",
    label: "Unhealthy for Sensitive Groups",
  },
  unhealthy: {
    color: "#FF0000",
    bg: "#FF0000",
    text: "#FFFFFF",
    label: "Unhealthy",
  },
  veryUnhealthy: {
    color: "#8F3F97",
    bg: "#8F3F97",
    text: "#FFFFFF",
    label: "Very Unhealthy",
  },
  hazardous: {
    color: "#7E0023",
    bg: "#7E0023",
    text: "#FFFFFF",
    label: "Hazardous",
  },
};

// AQI ranges
const AQI_RANGES = {
  good: { min: 0, max: 50 },
  moderate: { min: 51, max: 100 },
  unhealthySensitive: { min: 101, max: 150 },
  unhealthy: { min: 151, max: 200 },
  veryUnhealthy: { min: 201, max: 300 },
  hazardous: { min: 301, max: 500 },
};

function getAQICategory(aqi) {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthySensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "veryUnhealthy";
  return "hazardous";
}

function getAQIIcon(category) {
  switch (category) {
    case "good":
      return <FaCheckCircle className="text-green-500" />;
    case "moderate":
      return <FaInfoCircle className="text-yellow-500" />;
    case "unhealthySensitive":
      return <FaExclamationTriangle className="text-orange-500" />;
    case "unhealthy":
      return <FaExclamationTriangle className="text-red-500" />;
    case "veryUnhealthy":
      return <FaTimesCircle className="text-purple-500" />;
    case "hazardous":
      return <FaTimesCircle className="text-red-800" />;
    default:
      return <FaInfoCircle className="text-gray-500" />;
  }
}

export default function AirQuality() {
  const navigate = useNavigate();
  const [location, setLocation] = useState({
    lat: 12.0,
    lon: 8.5,
    name: "Default Location",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [airQualityData, setAirQualityData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleSearchLocation = async () => {
    if (!location.lat || !location.lon) {
      setError("Please select a location first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAirQualityData(location.lat, location.lon);
      setAirQualityData(data);
    } catch (err) {
      setError("Failed to fetch air quality data. Please try again.");
      console.error("Air quality fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (loc) => {
    setLocation({ lat: loc.lat, lon: loc.lon, name: loc.name });
    setSearchQuery(loc.name);
    // Clear previous data when location changes
    setAirQualityData(null);
    setError(null);
  };

  const aqiCategory = airQualityData
    ? getAQICategory(airQualityData.aqi)
    : null;
  const aqiInfo = aqiCategory ? AQI_COLORS[aqiCategory] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <FaArrowLeft className="text-xl text-indigo-600 dark:text-indigo-400" />
          </motion.button>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <FaWind /> Air Quality Checker
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaCloud className="text-gray-600" />
            )}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Search and Controls */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Location Search */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <FaMapMarkerAlt /> Search Location
            </h2>
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              value={location?.name || searchQuery}
              placeholder="Search for a city or location..."
            />
            {location?.name && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                📍 {location.name} (Lat: {location.lat.toFixed(2)}, Lon:{" "}
                {location.lon.toFixed(2)})
              </p>
            )}
          </div>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchLocation}
            disabled={isLoading || !location.lat}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FaSearch />
              </motion.div>
            ) : (
              <FaSearch />
            )}
            {isLoading ? "Checking Air Quality..." : "Check Air Quality"}
          </motion.button>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          {/* AQI Legend */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
            <h3 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
              Air Quality Index (AQI) Scale
            </h3>
            <div className="space-y-2">
              {Object.entries(AQI_COLORS).map(([key, info]) => (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {info.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {AQI_RANGES[key].min}-{AQI_RANGES[key].max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Results and Map */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Air Quality Results */}
          {airQualityData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-indigo-200 dark:border-indigo-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                  Air Quality Report
                </h2>
                {getAQIIcon(aqiCategory)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main AQI Display */}
                <div className="text-center">
                  <div
                    className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                    style={{ backgroundColor: aqiInfo?.color }}
                  >
                    {airQualityData.aqi}
                  </div>
                  <p
                    className="mt-2 text-lg font-semibold"
                    style={{ color: aqiInfo?.color }}
                  >
                    {aqiInfo?.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Air Quality Index
                  </p>
                </div>

                {/* Detailed Information */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      PM2.5
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {airQualityData.pm25?.toFixed(1) || "N/A"} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      PM10
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {airQualityData.pm10?.toFixed(1) || "N/A"} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ozone (O₃)
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {airQualityData.ozone?.toFixed(1) || "N/A"} ppb
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Last Updated
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(airQualityData.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Recommendations */}
              <div
                className="mt-6 p-4 rounded-lg"
                style={{ backgroundColor: `${aqiInfo?.color}20` }}
              >
                <h4
                  className="font-semibold mb-2"
                  style={{ color: aqiInfo?.color }}
                >
                  Health Recommendations
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {getHealthRecommendation(aqiCategory)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Interactive Air Quality Map */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
            <h3 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
              Air Quality Map
            </h3>
            <AirQualityMap
              location={location}
              airQualityData={airQualityData}
              onLocationSelect={handleLocationSelect}
              height="400px"
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Click on the map to select a location • Powered by NASA Giovanni
              API
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getHealthRecommendation(category) {
  switch (category) {
    case "good":
      return "Air quality is satisfactory, and air pollution poses little or no risk.";
    case "moderate":
      return "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.";
    case "unhealthySensitive":
      return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
    case "unhealthy":
      return "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.";
    case "veryUnhealthy":
      return "Health alert: The risk of health effects is increased for everyone.";
    case "hazardous":
      return "Health warning of emergency conditions: everyone is more likely to be affected.";
    default:
      return "No health recommendations available.";
  }
}
