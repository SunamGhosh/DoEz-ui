/**
 * LiveTrackingMap.jsx
 * ─────────────────────────────────────────────────────────────
 * Zomato-style real-time tracking map.
 *
 * • OSRM road-snapped blue route line (clean, not thick)
 * • Animated provider arrow marker with bearing
 * • Customer pulse dot
 * • ETA + distance card
 * • Turn-by-turn next instruction
 * • ResizeObserver → no gray tile gaps
 * • Works on both provider & customer side
 *
 * Props:
 *   customerLoc  [lat, lng]
 *   providerLoc  [lat, lng]
 * ─────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icons for Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ── Icons ──────────────────────────────────────────────────────
const makeCustomerIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(59,130,246,0.18);animation:ltmPulse 2s ease-out infinite"></div>
      <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(59,130,246,0.18);animation:ltmPulse 2s ease-out infinite 0.8s"></div>
      <div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);position:relative;z-index:2"></div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const makeProviderIcon = (bearing = 0) =>
  L.divIcon({
    className: "",
    html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(13,148,136,0.2);animation:ltmGlow 1.5s ease-in-out infinite alternate"></div>
      <div style="width:32px;height:32px;background:linear-gradient(135deg,#0d9488,#14b8a6);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(13,148,136,0.45);position:relative;z-index:2;transform:rotate(${bearing}deg);transition:transform 0.5s ease">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
      </div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

// ── Helpers ────────────────────────────────────────────────────
function getBearing(from, to) {
  const r = (d) => (d * Math.PI) / 180;
  const y = Math.sin(r(to[1] - from[1])) * Math.cos(r(to[0]));
  const x =
    Math.cos(r(from[0])) * Math.sin(r(to[0])) -
    Math.sin(r(from[0])) * Math.cos(r(to[0])) * Math.cos(r(to[1] - from[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const isValid = (loc) =>
  Array.isArray(loc) &&
  loc.length === 2 &&
  typeof loc[0] === "number" &&
  typeof loc[1] === "number" &&
  !isNaN(loc[0]) &&
  !isNaN(loc[1]);

async function fetchOSRM(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("OSRM error");
  return res.json();
}

function stepText(step) {
  const t = step?.maneuver?.type || "";
  const m = step?.maneuver?.modifier || "";
  const n = step?.name || "the road";
  const map = {
    turn: `Turn ${m} onto ${n}`,
    "new name": `Continue onto ${n}`,
    depart: `Head ${m || "forward"} on ${n}`,
    arrive: "Arrived at destination",
    merge: `Merge ${m}`,
    fork: `Keep ${m} at the fork`,
    "end of road": `Turn ${m}`,
    roundabout: "Take the roundabout",
    continue: `Continue on ${n}`,
  };
  return map[t] || `Continue on ${n}`;
}

// ─────────────────────────────────────────────────────────────
const LiveTrackingMap = ({ customerLoc, providerLoc, customerAddress }) => {
  const containerRef = useRef(null);
  const mapInst = useRef(null);
  const custMarker = useRef(null);
  const provMarker = useRef(null);
  const routeGroup = useRef(null);
  const prevProv = useRef(null);
  const resizeT = useRef(null);

  const [info, setInfo] = useState(null); // { distance, duration, nextStep }
  const [eta, setEta] = useState(null);
  const [routeError, setRouteError] = useState(false);

  // ── Init map ────────────────────────────────────────────────
  useEffect(() => {
    if (mapInst.current || !containerRef.current) return;

    const center = isValid(customerLoc)
      ? customerLoc
      : isValid(providerLoc)
        ? providerLoc
        : [20.5937, 78.9629];

    mapInst.current = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(mapInst.current);

    L.control.zoom({ position: "topright" }).addTo(mapInst.current);

    const centerMap = () => {
      if (!mapInst.current) return;
      if (isValid(customerLoc) && isValid(providerLoc)) {
        mapInst.current.fitBounds(L.latLngBounds([customerLoc, providerLoc]), { padding: [50, 50] });
      } else if (isValid(customerLoc)) {
        mapInst.current.setView(customerLoc, 14);
      } else if (isValid(providerLoc)) {
        mapInst.current.setView(providerLoc, 14);
      }
    };

    // Invalidate until modal settles
    const inv = () => {
      if (mapInst.current) {
        mapInst.current.invalidateSize();
        centerMap();
      }
    };

    inv();
    const t1 = setTimeout(inv, 150);
    const t2 = setTimeout(inv, 400);
    const t3 = setTimeout(inv, 800);

    const ro = new ResizeObserver(() => {
      clearTimeout(resizeT.current);
      resizeT.current = setTimeout(inv, 60);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(resizeT.current);
      ro.disconnect();
      mapInst.current?.remove();
      mapInst.current = null;
      custMarker.current = null;
      provMarker.current = null;
      routeGroup.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Customer marker ─────────────────────────────────────────
  useEffect(() => {
    if (!mapInst.current || !isValid(customerLoc)) return;
    if (custMarker.current) {
      custMarker.current.setLatLng(customerLoc);
    } else {
      custMarker.current = L.marker(customerLoc, {
        icon: makeCustomerIcon(),
        zIndexOffset: 100,
      })
        .addTo(mapInst.current)
        .bindPopup(customerAddress ? `<b>📍 Customer</b><br/><span style="font-size:11px;color:#666;">${customerAddress}</span>` : "<b>📍 Customer</b>");
    }
  }, [customerLoc, customerAddress]);

  // ── Provider marker ─────────────────────────────────────────
  useEffect(() => {
    if (!mapInst.current || !isValid(providerLoc)) return;
    const bearing = isValid(prevProv.current)
      ? getBearing(prevProv.current, providerLoc)
      : 0;
    prevProv.current = providerLoc;

    if (provMarker.current) {
      provMarker.current
        .setLatLng(providerLoc)
        .setIcon(makeProviderIcon(bearing));
    } else {
      provMarker.current = L.marker(providerLoc, {
        icon: makeProviderIcon(bearing),
        zIndexOffset: 200,
      })
        .addTo(mapInst.current)
        .bindPopup("<b>🔧 Provider</b>");
    }
  }, [providerLoc]);

  // ── Route drawing ───────────────────────────────────────────
  const drawRoute = useCallback(async () => {
    if (!mapInst.current || !isValid(customerLoc) || !isValid(providerLoc))
      return;

    setRouteError(false);

    try {
      const data = await fetchOSRM(providerLoc, customerLoc);
      if (!data?.routes?.length) throw new Error("No routes");

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      // Remove old route
      if (routeGroup.current) {
        mapInst.current.removeLayer(routeGroup.current);
        routeGroup.current = null;
      }

      // Zomato/Swiggy-style: Crisp solid line with a tiny dark border effect
      const outline = L.polyline(coords, {
        color: "rgba(13, 148, 136, 0.25)", // Soft teal backdrop
        weight: 7,
        lineCap: "round",
        lineJoin: "round",
      });

      const mainLine = L.polyline(coords, {
        color: "#0d9488", // Crisp doez-teal brand line
        weight: 3.5,
        lineCap: "round",
        lineJoin: "round",
      });

      routeGroup.current = L.layerGroup([outline, mainLine]).addTo(mapInst.current);

      // Fit bounds
      const bounds = L.latLngBounds([
        ...coords,
        customerLoc,
        providerLoc,
      ]);
      mapInst.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

      // Route info
      const steps = route.legs?.[0]?.steps || [];
      const nextStep =
        steps.find((s) => s?.maneuver?.type !== "depart") || steps[0];
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.ceil(route.duration / 60);

      setInfo({ distance: distKm, duration: durMin, nextStep });

      const arrival = new Date(Date.now() + route.duration * 1000);
      setEta(
        arrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch (err) {
      console.error("Route error:", err);
      setRouteError(true);

      // Fallback straight line
      if (routeGroup.current) {
        mapInst.current.removeLayer(routeGroup.current);
        routeGroup.current = null;
      }
      routeGroup.current = L.polyline([providerLoc, customerLoc], {
        color: "#4285F4",
        weight: 3,
        dashArray: "8, 6",
        opacity: 0.7,
      }).addTo(mapInst.current);

      const dist = L.latLng(providerLoc).distanceTo(L.latLng(customerLoc));
      setInfo({
        distance: (dist / 1000).toFixed(1),
        duration: Math.ceil(dist / 250),
        nextStep: null,
      });
    }
  }, [customerLoc, providerLoc]);

  useEffect(() => {
    // Only draw when both exist
    if (isValid(customerLoc) && isValid(providerLoc)) {
      drawRoute();
    }
  }, [customerLoc, providerLoc, drawRoute]);

  // ── Recenter ────────────────────────────────────────────────
  const recenter = () => {
    if (!mapInst.current) return;
    const pts = [customerLoc, providerLoc].filter(isValid);
    if (pts.length === 2) {
      mapInst.current.fitBounds(L.latLngBounds(pts), {
        padding: [50, 50],
        maxZoom: 16,
      });
    } else if (pts.length === 1) {
      mapInst.current.flyTo(pts[0], 15);
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "360px",
      }}
    >
      <style>{`
        @keyframes ltmPulse {
          0%   { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ltmGlow {
          from { box-shadow: 0 0 0 0 rgba(13,148,136,0.35); }
          to   { box-shadow: 0 0 0 12px rgba(13,148,136,0); }
        }
        @keyframes ltmSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Map */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: "360px" }}
      />

      {/* ── ETA Card (top-left) ── */}
      {info && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 1000,
            background: "white",
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            overflow: "hidden",
            minWidth: 150,
          }}
        >
          <div
            style={{
              background: "#4285F4",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.6)",
                animation: "ltmPulse 1.5s ease-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "white",
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Live Tracking
            </span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 3,
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {info.duration}
              </span>
              <span
                style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}
              >
                min
              </span>
            </div>
            <div
              style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}
            >
              {info.distance} km away
            </div>
            {eta && (
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: "1px solid #f3f4f6",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#4285F4",
                }}
              >
                ETA {eta}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Next Turn (bottom-left) ── */}
      {info?.nextStep && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            zIndex: 1000,
            background: "#0f172a",
            borderRadius: 12,
            padding: "10px 14px",
            maxWidth: 240,
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4285F4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <div>
            <div
              style={{
                fontSize: 9,
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 2,
              }}
            >
              Next turn
            </div>
            <div
              style={{
                fontSize: 11,
                color: "white",
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {stepText(info.nextStep)}
            </div>
            {info.nextStep?.distance > 0 && (
              <div
                style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}
              >
                in{" "}
                {info.nextStep.distance > 1000
                  ? `${(info.nextStep.distance / 1000).toFixed(1)} km`
                  : `${Math.round(info.nextStep.distance)} m`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Route error badge ── */}
      {routeError && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: 10,
            padding: "6px 14px",
            fontSize: 11,
            fontWeight: 600,
            color: "#92400e",
            whiteSpace: "nowrap",
          }}
        >
          ⚠️ Road route unavailable – showing direct path
        </div>
      )}

      {/* ── Recenter button (bottom-right, above zoom) ── */}
      <button
        type="button"
        onClick={recenter}
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          zIndex: 1000,
          width: 36,
          height: 36,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        title="Re-center"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4285F4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>

      {/* ── Waiting overlay ── */}
      {!isValid(customerLoc) && !isValid(providerLoc) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
          }}
        >
          <svg
            style={{ animation: "ltmSpin 1.2s linear infinite", marginBottom: 12 }}
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4285F4"
            strokeWidth="2"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <p
            style={{ fontWeight: 700, color: "#374151", fontSize: 14 }}
          >
            Waiting for location data…
          </p>
          <p
            style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}
          >
            Locations will appear once tracking begins
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
