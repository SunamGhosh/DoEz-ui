/**
 * LiveTrackingMap.jsx — Zomato-style real-time tracking
 *
 * Props:
 *   customerLoc   [lat, lng]   — customer's pinned booking address (destination)
 *   providerLoc   [lat, lng]   — provider's live GPS
 *   customerAddress string     — popup text
 *   providerPhone  string|null — call button (customer side)
 *   customerPhone  string|null — call button (provider side)
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

/* ── Helpers ─────────────────────────────────────────────── */

const isValid = (loc) =>
  Array.isArray(loc) && loc.length === 2 &&
  typeof loc[0] === "number" && typeof loc[1] === "number" &&
  !isNaN(loc[0]) && !isNaN(loc[1]);

const isServiceLoc = (loc) =>
  isValid(loc) &&
  loc[0] >= 6 &&
  loc[0] <= 38 &&
  loc[1] >= 68 &&
  loc[1] <= 98;

function haversineM(a, b) {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function getBearing(from, to) {
  const r = (d) => (d * Math.PI) / 180;
  const y = Math.sin(r(to[1] - from[1])) * Math.cos(r(to[0]));
  const x = Math.cos(r(from[0])) * Math.sin(r(to[0])) -
    Math.sin(r(from[0])) * Math.cos(r(to[0])) * Math.cos(r(to[1] - from[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

async function fetchOSRM(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("OSRM " + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function stepText(step) {
  const t = step?.maneuver?.type || "";
  const m = step?.maneuver?.modifier || "";
  const n = step?.name || "the road";
  const map = {
    turn: `Turn ${m} onto ${n}`, "new name": `Continue onto ${n}`,
    depart: `Head ${m || "forward"} on ${n}`, arrive: "Arrived at destination",
    merge: `Merge ${m}`, fork: `Keep ${m} at the fork`,
    "end of road": `Turn ${m}`, roundabout: "Take the roundabout",
    continue: `Continue on ${n}`,
  };
  return map[t] || `Continue on ${n}`;
}

/* ── Icons ───────────────────────────────────────────────── */

const customerIcon = () => L.divIcon({
  className: "",
  html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(59,130,246,0.18);animation:ltmPulse 2s ease-out infinite"></div>
    <div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);position:relative;z-index:2"></div>
  </div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

const providerIcon = (bearing = 0) => L.divIcon({
  className: "",
  html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
    <div style="width:32px;height:32px;background:linear-gradient(135deg,#0d9488,#14b8a6);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(13,148,136,0.45);transform:rotate(${bearing}deg);transition:transform 0.5s ease">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
    </div>
  </div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

/* ── Component ───────────────────────────────────────────── */

const CALL_DIST = 500; // metres
const MAX_TRACKING_DIST = 100000; // metres; guards against stale/bogus GPS coordinates

const LiveTrackingMap = ({ customerLoc, providerLoc, customerAddress, providerPhone, customerPhone }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const custRef = useRef(null);
  const provRef = useRef(null);
  const routeRef = useRef(null);
  const prevProvRef = useRef(null);

  const [info, setInfo] = useState(null);
  const [eta, setEta] = useState(null);
  const [nearbyCall, setNearbyCall] = useState(false);
  const [routeError, setRouteError] = useState(false);

  const hasPlausiblePair =
    isServiceLoc(customerLoc) &&
    isServiceLoc(providerLoc) &&
    haversineM(providerLoc, customerLoc) <= MAX_TRACKING_DIST;

  // ── 1. Init map (once) ──────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    console.log("[Map] Init");
    const center = isServiceLoc(customerLoc) ? customerLoc : isServiceLoc(providerLoc) ? providerLoc : [22.8, 86.2];

    const map = L.map(containerRef.current, { center, zoom: 14, zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;

    // Fix gray tiles
    setTimeout(() => map.invalidateSize(), 200);
    setTimeout(() => map.invalidateSize(), 600);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      custRef.current = null;
      provRef.current = null;
      routeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Customer marker ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isServiceLoc(customerLoc)) return;
    console.log("[Map] Customer marker @", customerLoc);

    if (custRef.current) {
      custRef.current.setLatLng(customerLoc);
    } else {
      custRef.current = L.marker(customerLoc, { icon: customerIcon(), zIndexOffset: 100 })
        .addTo(map)
        .bindPopup(customerAddress
          ? `<b>📍 Destination</b><br/><span style="font-size:11px;color:#666">${customerAddress}</span>`
          : "<b>📍 Destination</b>");
    }
  }, [customerLoc, customerAddress]);

  // ── 3. Provider marker ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isServiceLoc(providerLoc)) return;

    if (isServiceLoc(customerLoc) && haversineM(providerLoc, customerLoc) > MAX_TRACKING_DIST) {
      if (provRef.current) {
        map.removeLayer(provRef.current);
        provRef.current = null;
      }
      prevProvRef.current = null;
      return;
    }

    const bearing = isValid(prevProvRef.current) ? getBearing(prevProvRef.current, providerLoc) : 0;
    prevProvRef.current = providerLoc;
    console.log("[Map] Provider marker @", providerLoc, "bearing:", Math.round(bearing));

    if (provRef.current) {
      provRef.current.setLatLng(providerLoc).setIcon(providerIcon(bearing));
    } else {
      provRef.current = L.marker(providerLoc, { icon: providerIcon(bearing), zIndexOffset: 200 })
        .addTo(map)
        .bindPopup("<b>🔧 Provider</b>");
    }
  }, [providerLoc, customerLoc]);

  // ── 4. Route line + ETA ─────────────────────────────────
  const drawRoute = useCallback(async () => {
    const map = mapRef.current;
    if (!map || !isServiceLoc(customerLoc) || !isServiceLoc(providerLoc)) return;

    const distM = haversineM(providerLoc, customerLoc);

    if (distM > MAX_TRACKING_DIST) {
      if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
      setInfo(null);
      setEta(null);
      setNearbyCall(false);
      setRouteError(false);
      map.flyTo(customerLoc, 14, { duration: 0.5 });
      return;
    }

    console.log("[Map] Drawing route:", providerLoc, "→", customerLoc);
    setRouteError(false);
    setNearbyCall(distM <= CALL_DIST);

    try {
      const data = await fetchOSRM(providerLoc, customerLoc);
      if (!data?.routes?.length) throw new Error("No routes returned");

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      console.log("[Map] OSRM route points:", coords.length, "distance:", route.distance);

      // Remove old route
      if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }

      // Draw new route
      const outline = L.polyline(coords, { color: "rgba(13,148,136,0.25)", weight: 8, lineCap: "round", lineJoin: "round" });
      const line    = L.polyline(coords, { color: "#0d9488",              weight: 4, lineCap: "round", lineJoin: "round" });
      routeRef.current = L.layerGroup([outline, line]).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds([...coords, customerLoc, providerLoc]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });

      // ETA = 3 min per km
      const km = route.distance / 1000;
      const etaMin = Math.max(1, Math.ceil(km * 3));
      const steps = route.legs?.[0]?.steps || [];
      const nextStep = steps.find((s) => s?.maneuver?.type !== "depart") || steps[0];

      setInfo({ distKm: km.toFixed(1), etaMin, nextStep });
      setEta(new Date(Date.now() + etaMin * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      console.log("[Map] ETA:", etaMin, "min,", km.toFixed(1), "km");

    } catch (err) {
      console.warn("[Map] OSRM failed:", err.message, "— falling back to straight line");
      setRouteError(true);

      if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
      routeRef.current = L.polyline([providerLoc, customerLoc], {
        color: "#4285F4", weight: 3, dashArray: "8, 6", opacity: 0.7,
      }).addTo(map);

      const km = distM / 1000;
      const etaMin = Math.max(1, Math.ceil(km * 3));
      setInfo({ distKm: km.toFixed(1), etaMin, nextStep: null });
      setEta(new Date(Date.now() + etaMin * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      map.fitBounds(L.latLngBounds([providerLoc, customerLoc]), { padding: [60, 60], maxZoom: 16 });
    }
  }, [customerLoc, providerLoc]);

  useEffect(() => {
    if (hasPlausiblePair) {
      drawRoute();
    } else {
      if (routeRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeRef.current);
        routeRef.current = null;
      }
      setInfo(null);
      setEta(null);
      setNearbyCall(false);
      setRouteError(false);
    }
  }, [customerLoc, providerLoc, hasPlausiblePair, drawRoute]);

  // ── 5. Recenter button ──────────────────────────────────
  const recenter = () => {
    if (!mapRef.current) return;
    const pts = hasPlausiblePair ? [customerLoc, providerLoc] : [customerLoc, providerLoc].filter(isServiceLoc).slice(0, 1);
    if (pts.length === 2) mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 16 });
    else if (pts.length === 1) mapRef.current.flyTo(pts[0], 15);
  };

  // ── Render ──────────────────────────────────────────────
  const phone = providerPhone || customerPhone;
  const phoneLabel = providerPhone ? "Provider" : "Customer";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "300px" }}>
      <style>{`
        @keyframes ltmPulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
      `}</style>

      {/* Map */}
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "300px" }} />

      {/* ETA card */}
      {info && (
        <div style={{
          position: "absolute", top: 12, left: 12, zIndex: 1000,
          background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          overflow: "hidden", minWidth: 130, maxWidth: "calc(100% - 24px)"
        }}>
          <div style={{ background: "#0d9488", padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)", animation: "ltmPulse 1.5s ease-out infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "white", letterSpacing: 0.5, textTransform: "uppercase" }}>Live Tracking</span>
          </div>
          <div style={{ padding: "8px 10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 1 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#111827", lineHeight: 1 }}>{info.etaMin}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>min</span>
            </div>
            <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>{info.distKm} km away</div>
            {eta && (
              <div style={{ marginTop: 4, paddingTop: 4, borderTop: "1px solid #f3f4f6", fontSize: 10, fontWeight: 700, color: "#0d9488" }}>
                ETA {eta}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearby badge */}
      {nearbyCall && (
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 1100,
          background: "#16a34a", color: "white", padding: "4px 12px", borderRadius: 50,
          fontSize: 10, fontWeight: 700, boxShadow: "0 4px 16px rgba(22,163,74,0.4)", whiteSpace: "nowrap",
        }}>
          📍 Almost there — within 500 m!
        </div>
      )}

      {/* Call button */}
      {nearbyCall && phone && (
        <a href={`tel:${phone}`} style={{
          position: "absolute", bottom: 60, right: 12, zIndex: 1200,
          display: "flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "white",
          padding: "8px 14px", borderRadius: 50, fontWeight: 700, fontSize: 12,
          textDecoration: "none", boxShadow: "0 4px 20px rgba(22,163,74,0.45)", whiteSpace: "nowrap",
        }}>
          📞 Call {phoneLabel}
        </a>
      )}

      {/* Next turn instruction */}
      {info?.nextStep && (
        <div style={{
          position: "absolute", bottom: 12, left: 12, zIndex: 1000,
          background: "#0f172a", borderRadius: 10, padding: "8px 12px", maxWidth: "calc(100% - 70px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", gap: 6,
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 2 }}>
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 8, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 }}>Next turn</div>
            <div style={{ fontSize: 10, color: "white", fontWeight: 600, lineHeight: 1.3, wordBreak: "break-word" }}>{stepText(info.nextStep)}</div>
            {info.nextStep?.distance > 0 && (
              <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>
                in {info.nextStep.distance > 1000 ? `${(info.nextStep.distance / 1000).toFixed(1)} km` : `${Math.round(info.nextStep.distance)} m`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route error */}
      {routeError && (
        <div style={{
          position: "absolute", top: 48, left: "50%", transform: "translateX(-50%)", zIndex: 1000,
          background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 8,
          padding: "4px 10px", fontSize: 9, fontWeight: 600, color: "#92400e", whiteSpace: "nowrap",
        }}>
          ⚠️ Road route unavailable
        </div>
      )}

      {/* Recenter */}
      <button type="button" onClick={recenter} style={{
        position: "absolute", bottom: 12, right: 12, zIndex: 1000,
        width: 32, height: 32, background: "white", border: "1px solid #e5e7eb", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: 0
      }} title="Re-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>

      {/* Waiting overlay — only when BOTH locations missing */}
      {!isValid(customerLoc) && !isValid(providerLoc) && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
          padding: 20, textAlign: "center"
        }}>
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p style={{ fontWeight: 700, color: "#374151", fontSize: 13 }}>Waiting for location data…</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Locations will appear once tracking begins</p>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
