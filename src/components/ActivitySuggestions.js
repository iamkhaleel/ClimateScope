// src/components/ActivitySuggestions.js
import React from "react";

export default function ActivitySuggestions({ mostLikely, location, date }) {
  if (!mostLikely || Object.keys(mostLikely).length === 0) {
    return null;
  }

  const { Temperature, Rainfall, Humidity, "Wind Speed": Wind } = mostLikely;

  // Normalize date to a Date object
  let displayDate = "Unknown Date";
  try {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate)) {
      displayDate = parsedDate.toISOString().split("T")[0];
    }
  } catch {
    displayDate = "Unknown Date";
  }

  // Decide activities
  const good = [];
  const avoid = [];

  if (Temperature != null) {
    if (Temperature >= 20 && Temperature <= 30) {
      good.push("Outdoor sports", "Picnic", "Walking", "Cycling");
    } else if (Temperature > 35) {
      avoid.push("Outdoor sports", "Long walking", "Picnic");
      good.push("Swimming", "Indoor gym");
    } else if (Temperature < 15) {
      avoid.push("Picnic", "Swimming");
      good.push("Indoor activities", "Reading", "Cooking at home");
    }
  }

  if (Rainfall != null) {
    if (Rainfall > 5) {
      avoid.push("Picnic", "Cycling", "Outdoor farming");
      good.push("Indoor games", "Watching movies");
    }
  }

  if (Humidity != null) {
    if (Humidity > 80) {
      avoid.push("Running", "Outdoor heavy exercise");
      good.push("Indoor rest", "Light reading");
    }
  }

  if (Wind != null) {
    if (Wind > 10) {
      avoid.push("Flying drones", "Cycling", "Boating");
      good.push("Kite flying");
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Activity Suggestions
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        Based on most likely conditions for <strong>{displayDate}</strong> in{" "}
        <strong>{location?.name ?? "Unknown Location"}</strong>:
      </p>

      <p className="text-gray-700 mb-2">
        🌡 Temperature: {Temperature?.toFixed(1) ?? "N/A"} °C, 🌧 Rainfall:{" "}
        {Rainfall?.toFixed(1) ?? "N/A"} mm, 💨 Wind: {Wind?.toFixed(1) ?? "N/A"}{" "}
        m/s, 💧 Humidity: {Humidity?.toFixed(1) ?? "N/A"}%
      </p>

      {good.length > 0 && (
        <div className="mb-2">
          ✅ <span className="font-medium">Good for:</span>{" "}
          {Array.from(new Set(good)).join(", ")}
        </div>
      )}
      {avoid.length > 0 && (
        <div>
          ⚠️ <span className="font-medium">Avoid:</span>{" "}
          {Array.from(new Set(avoid)).join(", ")}
        </div>
      )}
    </div>
  );
}
