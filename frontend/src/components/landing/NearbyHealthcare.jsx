import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { FiNavigation } from "react-icons/fi";
import API from "../../api/axios";
import "leaflet/dist/leaflet.css";

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4320/4320371.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const ChangeMapView = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);

  return null;
};

const NearbyHealthcare = ({ emergencyTheme = false }) => {
  const [userLocation, setUserLocation] = useState([23.2599, 77.4126]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNearbyHealthcare = async (lat, lng) => {
    try {
      setLoading(true);
      setError("");

      const radius = 5000;

      const response = await API.get("/nearby-healthcare", {
        params: {
          lat,
          lng,
          radius,
        },
      });

      setPlaces(response.data.places || []);
    } catch (error) {
      setPlaces([]);
      setError(
        error.response?.data?.message ||
          "Unable to fetch nearby healthcare locations.",
      );
    } finally {
      setLoading(false);
    }
  };

  const findNearbyHealthcare = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserLocation(location);
        fetchNearbyHealthcare(location[0], location[1]);
      },
      () => {
        setError("Please allow location permission.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/30 bg-white/20 p-3 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3 px-2">
        <div>
          <p
            className={`text-xs font-extrabold uppercase tracking-wide ${
              emergencyTheme ? "text-white/90" : "text-slate-800"
            }`}
          >
            Nearby Healthcare
          </p>

          <p
            className={`mt-1 text-xs ${
              emergencyTheme ? "text-white/70" : "text-slate-500"
            }`}
          >
            {loading
              ? "Finding nearby locations..."
              : `${places.length} locations found nearby`}
          </p>
        </div>

        <button
          onClick={findNearbyHealthcare}
          disabled={loading}
          className={`flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-bold uppercase shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${
            emergencyTheme
              ? "bg-white text-red-600"
              : "bg-red-600 text-white"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          <FiNavigation />
          Find Nearby
        </button>
      </div>

      {error && (
        <p
          className={`mb-3 rounded-2xl px-3 py-2 text-xs font-semibold ${
            emergencyTheme
              ? "bg-white/15 text-white"
              : "bg-red-50 text-red-700"
          }`}
        >
          {error}
        </p>
      )}

      <div className="h-[390px] overflow-hidden rounded-[1.5rem] bg-white">
        <MapContainer
          center={userLocation}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <ChangeMapView center={userLocation} />

          <TileLayer
            attribution="OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your current location</Popup>
          </Marker>

          <Circle
            center={userLocation}
            radius={5000}
            pathOptions={{
              color: "red",
              fillColor: "red",
              fillOpacity: 0.08,
            }}
          />

          {places.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={hospitalIcon}
            >
              <Popup>
                <div>
                  <strong>{place.name}</strong>
                  <br />
                  <span className="capitalize">{place.type}</span>
                  {place.address ? (
                    <>
                      <br />
                      <span>{place.address}</span>
                    </>
                  ) : null}
                  {place.distanceMeters ? (
                    <>
                      <br />
                      <span>{Math.round(place.distanceMeters)} meters away</span>
                    </>
                  ) : null}
                  <br />
                  <a
                    href={`https://www.openstreetmap.org/directions?from=${userLocation[0]},${userLocation[1]}&to=${place.lat},${place.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default NearbyHealthcare;
