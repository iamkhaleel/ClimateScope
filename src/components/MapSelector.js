import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

export default function MapSelector({ setLocation }) {
  const [position, setPosition] = useState([12.0, 8.5]); // default Kano

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
      },
    });
    return position === null ? null : <Marker position={position} />;
  }

  return (
    <MapContainer center={position} zoom={6} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}
