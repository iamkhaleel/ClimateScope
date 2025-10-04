// src/components/MapSelector.js
import React, { useEffect } from "react";
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

/* Use CDN marker icons to avoid webpack asset issues */
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// helper: recenter map when location changes
function Recenter({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location && location.lat != null && location.lon != null) {
      try {
        map.setView([location.lat, location.lon], map.getZoom() || 8, {
          animate: true,
        });
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lon]);
  return null;
}

// helper: handle clicks on the map
function ClickHandler({ setLocation }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      // Set temporary location with coordinates
      const tempLocation = {
        lat,
        lon: lng,
        name: `Pinned: ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
      };
      setLocation(tempLocation);

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
          setLocation({
            lat,
            lon: lng,
            name: data.display_name,
          });
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        // Keep the temporary location with coordinates if reverse geocoding fails
      }
    },
  });
  return null;
}

export default function MapSelector({ setLocation, location }) {
  const center = [location?.lat ?? 12.0, location?.lon ?? 8.5];
  return (
    <div className="w-full h-full relative z-0">
      {/* MapContainer will fill parent div */}
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <ClickHandler setLocation={setLocation} />
        <Recenter location={location} />
        {location && location.lat != null && (
          <Marker position={[location.lat, location.lon]} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{location.name ?? "Selected location"}</strong>
                <div className="text-xs mt-1">
                  Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
