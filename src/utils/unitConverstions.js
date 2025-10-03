// unitConversions.js

export function convertTemperature(values, unit) {
  if (unit === "F") {
    return values.map((c) => (c != null ? (c * 9) / 5 + 32 : null));
  }
  return values; // default Celsius
}

export function convertRainfall(values, unit) {
  if (unit === "in") {
    return values.map((mm) => (mm != null ? mm * 0.0393701 : null));
  }
  return values; // default mm
}

export function convertWindSpeed(values, unit) {
  return values.map((mps) => {
    if (mps == null) return null;
    switch (unit) {
      case "kmh":
        return mps * 3.6;
      case "mph":
        return mps * 2.23694;
      default:
        return mps; // default m/s
    }
  });
}

// Humidity already % so no conversion needed
export function convertHumidity(values) {
  return values;
}
