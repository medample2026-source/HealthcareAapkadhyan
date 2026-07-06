const https = require("https");

const OVERPASS_ENDPOINTS = [
  {
    hostname: "overpass-api.de",
    path: "/api/interpreter",
  },
  {
    hostname: "lz4.overpass-api.de",
    path: "/api/interpreter",
  },
];
const DEFAULT_RADIUS_METERS = 5000;
const MAX_RADIUS_METERS = 10000;
const MAX_RESULTS = 25;
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12000;

const nearbyCache = new Map();

const clampRadius = (radius) => {
  const parsedRadius = Number(radius);

  if (!Number.isFinite(parsedRadius) || parsedRadius <= 0) {
    return DEFAULT_RADIUS_METERS;
  }

  return Math.min(Math.round(parsedRadius), MAX_RADIUS_METERS);
};

const parseCoordinate = (value, min, max) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < min || parsedValue > max) {
    return null;
  }

  return parsedValue;
};

const buildCacheKey = (latitude, longitude, radius) => {
  return `${latitude.toFixed(3)}:${longitude.toFixed(3)}:${radius}`;
};

const pruneCache = () => {
  const now = Date.now();

  for (const [key, value] of nearbyCache.entries()) {
    if (now - value.createdAt > CACHE_TTL_MS) {
      nearbyCache.delete(key);
    }
  }

  if (nearbyCache.size <= 100) return;

  const oldestKeys = [...nearbyCache.entries()]
    .sort((a, b) => a[1].createdAt - b[1].createdAt)
    .slice(0, nearbyCache.size - 100)
    .map(([key]) => key);

  oldestKeys.forEach((key) => nearbyCache.delete(key));
};

const calculateDistanceMeters = (fromLat, fromLng, toLat, toLng) => {
  const earthRadiusMeters = 6371000;
  const toRadians = (degree) => (degree * Math.PI) / 180;

  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return Math.round(
    earthRadiusMeters *
      2 *
      Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)),
  );
};

const buildOverpassQuery = (latitude, longitude, radius) => `
  [out:json][timeout:10];
  nwr["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${latitude},${longitude});
  out center ${MAX_RESULTS};
`;

const requestOverpass = (endpoint, query) => {
  const body = new URLSearchParams({ data: query }).toString();

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: endpoint.hostname,
        path: endpoint.path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
          "User-Agent": "HealthcareAapkadhyan/1.0 nearby-healthcare",
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (response) => {
        let rawData = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          rawData += chunk;
        });

        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(
              new Error(`Overpass API returned status ${response.statusCode}`),
            );
          }

          try {
            return resolve(JSON.parse(rawData));
          } catch {
            return reject(new Error("Overpass API returned invalid JSON"));
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("Overpass API request timed out"));
    });

    request.on("error", reject);
    request.write(body);
    request.end();
  });
};

const normalizeAddress = (tags = {}) => {
  return [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
  ]
    .filter(Boolean)
    .join(", ");
};

const fetchOverpassWithFallback = async (query) => {
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await requestOverpass(endpoint, query);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Overpass API request failed");
};

const normalizePlaces = (elements = [], latitude, longitude) => {
  return elements
    .map((item) => {
      const lat = item.lat ?? item.center?.lat;
      const lng = item.lon ?? item.center?.lon;

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return {
        id: `${item.type}-${item.id}`,
        name: item.tags?.name || "Healthcare Location",
        type: item.tags?.amenity || "healthcare",
        lat,
        lng,
        address: normalizeAddress(item.tags),
        distanceMeters: calculateDistanceMeters(latitude, longitude, lat, lng),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_RESULTS);
};

exports.getNearbyHealthcare = async (req, res) => {
  try {
    const latitude = parseCoordinate(req.query.lat, -90, 90);
    const longitude = parseCoordinate(req.query.lng, -180, 180);

    if (latitude === null || longitude === null) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required.",
      });
    }

    const radius = clampRadius(req.query.radius);
    const cacheKey = buildCacheKey(latitude, longitude, radius);
    const cached = nearbyCache.get(cacheKey);

    if (cached && Date.now() - cached.createdAt <= CACHE_TTL_MS) {
      return res.status(200).json({
        success: true,
        cached: true,
        count: cached.places.length,
        places: cached.places,
      });
    }

    const data = await fetchOverpassWithFallback(
      buildOverpassQuery(latitude, longitude, radius),
    );

    const places = normalizePlaces(data.elements, latitude, longitude);

    nearbyCache.set(cacheKey, {
      createdAt: Date.now(),
      places,
    });
    pruneCache();

    return res.status(200).json({
      success: true,
      cached: false,
      count: places.length,
      places,
    });
  } catch (error) {
    console.error("Nearby healthcare lookup error:", error.message);

    return res.status(502).json({
      success: false,
      message:
        "Nearby healthcare service is temporarily unavailable. Please try again.",
    });
  }
};
