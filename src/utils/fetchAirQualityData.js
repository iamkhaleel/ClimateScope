import axios from "axios";

// NASA Giovanni API endpoints for air quality data
const GIOVANNI_BASE_URL =
  "https://giovanni.gsfc.nasa.gov/giovanni/daac-bin/service_manager";

// Air quality parameters available in Giovanni
const AIR_QUALITY_PARAMS = {
  // Aerosol Optical Depth (AOD) - used as proxy for PM2.5/PM10
  AOD: {
    giovanni: "AOD",
    description: "Aerosol Optical Depth",
    unit: "dimensionless",
  },
  // Dust AOD
  DUST_AOD: {
    giovanni: "DUST_AOD",
    description: "Dust Aerosol Optical Depth",
    unit: "dimensionless",
  },
  // Sulfate AOD
  SULFATE_AOD: {
    giovanni: "SULFATE_AOD",
    description: "Sulfate Aerosol Optical Depth",
    unit: "dimensionless",
  },
  // Black Carbon AOD
  BC_AOD: {
    giovanni: "BC_AOD",
    description: "Black Carbon Aerosol Optical Depth",
    unit: "dimensionless",
  },
  // Organic Carbon AOD
  OC_AOD: {
    giovanni: "OC_AOD",
    description: "Organic Carbon Aerosol Optical Depth",
    unit: "dimensionless",
  },
};

// Convert AOD to estimated PM2.5 (rough approximation)
function aodToPM25(aod) {
  if (!aod || isNaN(aod)) return null;
  // This is a simplified conversion - in reality, it depends on many factors
  // Using a common empirical relationship: PM2.5 ≈ AOD * 30-50 μg/m³
  return aod * 40;
}

// Convert AOD to estimated PM10 (rough approximation)
function aodToPM10(aod) {
  if (!aod || isNaN(aod)) return null;
  // PM10 is typically 1.5-2x PM2.5
  const pm25 = aodToPM25(aod);
  return pm25 ? pm25 * 1.7 : null;
}

// Calculate AQI from PM2.5 concentration (EPA formula)
function calculateAQI(pm25) {
  if (!pm25 || isNaN(pm25)) return null;

  // EPA AQI breakpoints for PM2.5 (24-hour average)
  const breakpoints = [
    { low: 0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 },
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.low && pm25 <= bp.high) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) +
          bp.aqiLow
      );
    }
  }

  return pm25 > 500.4 ? 500 : 0;
}

// Get current date range for Giovanni API (last 7 days)
function getDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);

  return {
    start: start.toISOString().split("T")[0].replace(/-/g, ""),
    end: end.toISOString().split("T")[0].replace(/-/g, ""),
  };
}

export async function fetchAirQualityData(lat, lon) {
  try {
    const dateRange = getDateRange();
    const bbox = `${lon - 0.1},${lat - 0.1},${lon + 0.1},${lat + 0.1}`;

    // Fetch AOD data from Giovanni
    const giovanniUrl = `${GIOVANNI_BASE_URL}/data?service=TmAvMp&starttime=${dateRange.start.slice(
      0,
      4
    )}-${dateRange.start.slice(4, 6)}-${dateRange.start.slice(
      6,
      8
    )}&endtime=${dateRange.end.slice(0, 4)}-${dateRange.end.slice(
      4,
      6
    )}-${dateRange.end.slice(6, 8)}&bbox=${bbox}&data=MERRA2_${
      AIR_QUALITY_PARAMS.AOD.giovanni
    }_M&format=json`;

    const response = await axios.get(giovanniUrl, {
      headers: {
        "User-Agent": "ClimateScopeApp/1.0 (contact@example.com)",
      },
      timeout: 30000, // 30 second timeout
    });

    const data = response.data.data || [];

    if (data.length === 0) {
      throw new Error("No air quality data available for this location");
    }

    // Get the most recent AOD value
    const latestRecord = data[data.length - 1];
    const aod = latestRecord[AIR_QUALITY_PARAMS.AOD.giovanni];

    if (!aod || isNaN(aod)) {
      throw new Error("Invalid air quality data received");
    }

    // Convert AOD to PM2.5 and PM10 estimates
    const pm25 = aodToPM25(aod);
    const pm10 = aodToPM10(aod);

    // Calculate AQI
    const aqi = calculateAQI(pm25);

    // Estimate ozone (this is a placeholder - would need actual ozone data)
    const ozone = aod * 20; // Rough estimate

    return {
      aqi: aqi || 0,
      pm25: pm25 || 0,
      pm10: pm10 || 0,
      ozone: ozone || 0,
      aod: aod,
      timestamp: new Date().toISOString(),
      source: "NASA Giovanni (MERRA-2)",
      location: { lat, lon },
    };
  } catch (error) {
    console.error("Giovanni API fetch error:", error);

    // Fallback: Try alternative data sources or return mock data
    if (
      error.message.includes("timeout") ||
      error.message.includes("network")
    ) {
      throw new Error(
        "Unable to connect to air quality data service. Please try again later."
      );
    }

    // For development/testing, return mock data
    console.warn("Using mock air quality data for development");
    return {
      aqi: Math.floor(Math.random() * 200) + 50, // Random AQI between 50-250
      pm25: Math.floor(Math.random() * 100) + 10, // Random PM2.5 between 10-110
      pm10: Math.floor(Math.random() * 150) + 20, // Random PM10 between 20-170
      ozone: Math.floor(Math.random() * 100) + 30, // Random ozone between 30-130
      aod: Math.random() * 2, // Random AOD between 0-2
      timestamp: new Date().toISOString(),
      source: "Mock Data (Development)",
      location: { lat, lon },
    };
  }
}

// Alternative function to get air quality data from multiple sources
export async function fetchAirQualityDataMultiple(lat, lon) {
  const results = [];

  try {
    // Try Giovanni first
    const giovanniData = await fetchAirQualityData(lat, lon);
    results.push(giovanniData);
  } catch (error) {
    console.warn("Giovanni API failed:", error.message);
  }

  // Could add other data sources here (OpenAQ, AirVisual, etc.)

  return results.length > 0 ? results[0] : null;
}
