/**
 * BookingMap.jsx
 * ─────────────────────────────────────────────────────────────
 * Interactive Leaflet map for the booking modal.
 *
 * • Animated teal pin-drop on GPS location
 * • Pulse ripple on marker
 * • "Locate Me" button (no overlap with zoom controls)
 * • Draggable pin → reverse-geocodes on drag-end
 * • Tap-to-pin anywhere
 * • ResizeObserver → no gray tile gaps in modals
 *
 * Props:
 *   onLocationSelect  ({ lat, lng })
 *   onAddressChange   (address string)
 *   initialLat        (number)
 *   initialLng        (number)
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

// ── Teal pin icon ─────────────────────────────────────────────
const makePinIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(13,148,136,0.18);animation:bkRipple 1.8s ease-out infinite"></div>
      <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(13,148,136,0.18);animation:bkRipple 1.8s ease-out infinite 0.7s"></div>
      <div style="width:28px;height:28px;background:linear-gradient(135deg,#0d9488,#14b8a6);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(13,148,136,0.45);position:relative;z-index:2;animation:bkDrop 0.4s cubic-bezier(0.34,1.56,0.64,1) both">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="13" height="13" style="transform:rotate(45deg)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
      </div>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });



// ─────────────────────────────────────────────────────────────
const BookingMap = ({
  onLocationSelect,
  onAddressChange,
  initialLat,
  initialLng,
}) => {
  const containerRef = useRef(null);
  const mapInst = useRef(null);
  const markerRef = useRef(null);
  const resizeT = useRef(null);
  const [isLocating, setIsLocating] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [status, setStatus] = useState("");

  // ── Place / move marker ─────────────────────────────────────
  const placePin = useCallback(
    async (lat, lng, fly = true) => {
      if (!mapInst.current) return;
      const icon = makePinIcon();

      if (fly) {
        mapInst.current.flyTo([lat, lng], 16, {
          duration: 1,
          easeLinearity: 0.4,
        });
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]).setIcon(icon);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon,
          draggable: true,
        }).addTo(mapInst.current);

        markerRef.current.on("dragend", async () => {
          const { lat: nLat, lng: nLng } = markerRef.current.getLatLng();
          onLocationSelect?.({ lat: nLat, lng: nLng });
        });
      }

      setPinned(true);
      onLocationSelect?.({ lat, lng });

      setStatus("📍 Location pinned");
      setTimeout(() => setStatus(""), 2000);
    },
    [onLocationSelect, onAddressChange]
  );

  // ── Init map ────────────────────────────────────────────────
  useEffect(() => {
    if (mapInst.current || !containerRef.current) return;

    const hasInit = initialLat && initialLng;

    mapInst.current = L.map(containerRef.current, {
      center: hasInit ? [initialLat, initialLng] : [20.5937, 78.9629],
      zoom: hasInit ? 15 : 5,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(mapInst.current);

    // Zoom controls at top-right (won't overlap Locate Me)
    L.control.zoom({ position: "topright" }).addTo(mapInst.current);

    // Tap to pin
    mapInst.current.on("click", (e) => placePin(e.latlng.lat, e.latlng.lng));

    if (hasInit) placePin(initialLat, initialLng, false);

    // Invalidate size for modal animation
    const inv = () => mapInst.current?.invalidateSize();
    inv();
    const t1 = setTimeout(inv, 100);
    const t2 = setTimeout(inv, 300);
    const t3 = setTimeout(inv, 600);
    const t4 = setTimeout(inv, 1000);

    const ro = new ResizeObserver(() => {
      clearTimeout(resizeT.current);
      resizeT.current = setTimeout(inv, 50);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(resizeT.current);
      ro.disconnect();
      mapInst.current?.remove();
      mapInst.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Locate Me ───────────────────────────────────────────────
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setStatus("⚠️ Geolocation not supported");
      return;
    }
    setIsLocating(true);
    setStatus("Acquiring GPS…");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        placePin(coords.latitude, coords.longitude);
      },
      () => {
        setIsLocating(false);
        setStatus("⚠️ Location access denied");
        setTimeout(() => setStatus(""), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        @keyframes bkRipple {
          0%   { transform:scale(0.4); opacity:1; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes bkDrop {
          0%   { opacity:0; transform:rotate(-45deg) translateY(-18px) scale(0.5); }
          100% { opacity:1; transform:rotate(-45deg) translateY(0) scale(1); }
        }
        @keyframes bkSpin {
          to { transform:rotate(360deg); }
        }
      `}</style>

      {/* Map canvas */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: 260 }}
      />

      {/* ── Tap hint ── */}
      {!pinned && !isLocating && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(6px)",
            color: "white",
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          📍 Tap the map to pin your location
        </div>
      )}

      {/* ── Status toast ── */}
      {status && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: pinned
              ? "linear-gradient(135deg,#0d9488,#14b8a6)"
              : "rgba(15,23,42,0.85)",
            color: "white",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {status}
        </div>
      )}

      {/* ── Locate Me button (bottom-right, no overlap with zoom at top-right) ── */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={isLocating}
        style={{
          position: "absolute",
          bottom: 16,
          right: 12,
          zIndex: 1000,
          background: isLocating
            ? "linear-gradient(135deg,#0d9488,#14b8a6)"
            : "white",
          color: isLocating ? "white" : "#0d9488",
          border: "2px solid #0d9488",
          borderRadius: 10,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 700,
          fontSize: 12,
          cursor: isLocating ? "wait" : "pointer",
          boxShadow: "0 3px 12px rgba(13,148,136,0.3)",
          transition: "all 0.2s",
        }}
      >
        {isLocating ? (
          <svg
            style={{ animation: "bkSpin 0.9s linear infinite" }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        )}
        {isLocating ? "Locating…" : "Locate Me"}
      </button>
    </div>
  );
};

export default BookingMap;
