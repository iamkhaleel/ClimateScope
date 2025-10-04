import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// AQI color scheme
const AQI_COLORS = {
  good: "#00E400",
  moderate: "#FFFF00",
  unhealthySensitive: "#FF7E00",
  unhealthy: "#FF0000",
  veryUnhealthy: "#8F3F97",
  hazardous: "#7E0023",
};

// Custom marker icons for different AQI levels
const createAQIMarkerIcon = (aqi) => {
  let color = AQI_COLORS.good;
  if (aqi > 300) color = AQI_COLORS.hazardous;
  else if (aqi > 200) color = AQI_COLORS.veryUnhealthy;
  else if (aqi > 150) color = AQI_COLORS.unhealthy;
  else if (aqi > 100) color = AQI_COLORS.unhealthySensitive;
  else if (aqi > 50) color = AQI_COLORS.moderate;

  return new L.DivIcon({
    className: "custom-aqi-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${aqi}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Regular marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper: Recenter map when location changes
function Recenter({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location && location.lat != null && location.lon != null) {
      try {
        map.setView([location.lat, location.lon], map.getZoom() || 10, {
          animate: true,
        });
      } catch (e) {
        // ignore
      }
    }
  }, [location?.lat, location?.lon]);
  return null;
}

// Helper: Handle clicks on the map
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      // Set temporary location with coordinates
      const tempLocation = {
        lat,
        lon: lng,
        name: `Pinned: ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
      };
      onLocationSelect(tempLocation);

      // Try to get the actual place name using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              "User-Agent": "ClimateScopeApp/1.0 (contact@example.com)",
            },
          }
        );
        const data = await response.json();

        if (data && data.display_name) {
          // Update location with the actual place name
          onLocationSelect({
            lat,
            lon: lng,
            name: data.display_name,
          });
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    },
  });
  return null;
}

// Air Quality Grid Overlay Component
function AirQualityGrid({ airQualityData, location }) {
  const map = useMap();
  const [gridLayer, setGridLayer] = useState(null);

  useEffect(() => {
    if (!airQualityData || !location) return;

    // Create a grid of air quality data around the selected location
    const gridSize = 0.1; // degrees
    const gridPoints = [];

    for (
      let lat = location.lat - gridSize;
      lat <= location.lat + gridSize;
      lat += gridSize / 2
    ) {
      for (
        let lon = location.lon - gridSize;
        lon <= location.lon + gridSize;
        lon += gridSize / 2
      ) {
        // Simulate varying AQI values around the location
        const distance = Math.sqrt(
          Math.pow(lat - location.lat, 2) + Math.pow(lon - location.lon, 2)
        );
        const aqiVariation = Math.random() * 50 - 25; // ±25 AQI variation
        const baseAQI = airQualityData.aqi;
        const simulatedAQI = Math.max(0, Math.min(500, baseAQI + aqiVariation));

        gridPoints.push({
          lat,
          lon,
          aqi: simulatedAQI,
        });
      }
    }

    // Remove existing grid layer
    if (gridLayer) {
      map.removeLayer(gridLayer);
    }

    // Create new grid layer
    const newGridLayer = L.layerGroup();

    gridPoints.forEach((point) => {
      const marker = L.marker([point.lat, point.lon], {
        icon: createAQIMarkerIcon(point.aqi),
      });

      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>Air Quality Index</strong><br/>
          <span style="font-size: 18px; font-weight: bold;">${
            point.aqi
          }</span><br/>
          <small>Lat: ${point.lat.toFixed(4)}, Lon: ${point.lon.toFixed(
        4
      )}</small>
        </div>
      `);

      newGridLayer.addLayer(marker);
    });

    // Add grid layer to map
    newGridLayer.addTo(map);
    setGridLayer(newGridLayer);

    // Cleanup function
    return () => {
      if (newGridLayer) {
        map.removeLayer(newGridLayer);
      }
    };
  }, [airQualityData, location, map]);

  return null;
}

export default function AirQualityMap({
  location,
  airQualityData,
  onLocationSelect,
  height = "400px",
}) {
  const center = [location?.lat ?? 12.0, location?.lon ?? 8.5];

  return (
    <div className="w-full" style={{ height }}>
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <ClickHandler onLocationSelect={onLocationSelect} />
        <Recenter location={location} />

        {/* Main location marker */}
        {location && location.lat != null && (
          <Marker position={[location.lat, location.lon]} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{location.name ?? "Selected location"}</strong>
                <div className="text-xs mt-1">
                  Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
                </div>
                {airQualityData && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <div className="font-semibold">
                      Air Quality: {airQualityData.aqi}
                    </div>
                    <div className="text-xs">
                      PM2.5: {airQualityData.pm25?.toFixed(1)} μg/m³
                      <br />
                      PM10: {airQualityData.pm10?.toFixed(1)} μg/m³
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Air Quality Grid Overlay */}
        {airQualityData && (
          <AirQualityGrid airQualityData={airQualityData} location={location} />
        )}
      </MapContainer>
    </div>
  );
}
