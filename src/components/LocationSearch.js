// src/components/LocationSearch.js
import React, { useState, useRef, useEffect } from "react";

/**
 * LocationSearch
 * Props:
 *  - onLocationSelect({ lat, lon, name })
 *
 * Uses OpenStreetMap Nominatim (no API key). Debounced requests to avoid rate limit.
 */
export default function LocationSearch({
  onLocationSelect,
  placeholder = "Search for a place...",
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fetchSuggestions = (q) => {
    if (!q || q.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // debounce 350ms
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&addressdetails=1&limit=8`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "ClimateScopeApp/1.0 (contact@example.com)",
          },
        });
        const data = await res.json();
        if (!activeRef.current) return;
        setSuggestions(data || []);
      } catch (err) {
        console.error("Nominatim search error:", err);
      } finally {
        if (activeRef.current) setLoading(false);
      }
    }, 350);
  };

  const handleChange = (val) => {
    setQuery(val);
    fetchSuggestions(val);
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    if (onLocationSelect) {
      onLocationSelect({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        name: place.display_name,
      });
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {loading && (
        <div className="absolute right-3 top-3 text-xs text-gray-500">
          Searching…
        </div>
      )}

      {suggestions.length > 0 && (
        <ul
          className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-60 max-h-56 overflow-y-auto text-sm"
          style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}
        >
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
              onClick={() => handleSelect(s)}
            >
              <div className="font-medium text-sm text-gray-800 truncate">
                {s.display_name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {s.type ? `${s.type}` : ""}
                {s.address && s.address.country
                  ? ` • ${s.address.country}`
                  : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
