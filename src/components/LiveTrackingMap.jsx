import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const customerIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const providerIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

const isValidLoc = (loc) => {
    return loc && Array.isArray(loc) && typeof loc[0] === 'number' && typeof loc[1] === 'number' && !isNaN(loc[0]) && !isNaN(loc[1]);
};

// Helper to update map bounds to show both markers
function UpdateBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        const validPoints = points.filter(isValidLoc);
        if (validPoints.length >= 2) {
            try {
                map.fitBounds(validPoints, { padding: [50, 50] });
            } catch (e) {
                console.error("Fit bounds error:", e);
            }
        }
    }, [points, map]);
    return null;
}

const LiveTrackingMap = ({ customerLoc, providerLoc }) => {
    const [distance, setDistance] = useState(null);
    const [providerPath, setProviderPath] = useState([]);

    useEffect(() => {
        if (isValidLoc(customerLoc) && isValidLoc(providerLoc)) {
            try {
                const dist = L.latLng(customerLoc).distanceTo(L.latLng(providerLoc));
                setDistance((dist / 1000).toFixed(2)); // convert to km
            } catch (e) {
                console.error("Distance calculation error:", e);
            }
        }
    }, [customerLoc, providerLoc]);

    // Track provider's movement history
    useEffect(() => {
        if (isValidLoc(providerLoc)) {
            setProviderPath(prev => {
                // Only add if position actually changed significantly (e.g. > 10m)
                if (prev.length === 0) return [providerLoc];
                const last = prev[prev.length - 1];
                const distMoved = L.latLng(last).distanceTo(L.latLng(providerLoc));
                if (distMoved > 10) {
                    return [...prev, providerLoc];
                }
                return prev;
            });
        }
    }, [providerLoc]);

    // Ensure we have a valid center. Default to India if nothing else.
    let center = [20.5937, 78.9629];
    if (isValidLoc(customerLoc)) center = customerLoc;
    else if (isValidLoc(providerLoc)) center = providerLoc;

    return (
        <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%', minHeight: '400px' }}
                whenReady={(mapInstance) => {
                    setTimeout(() => {
                        mapInstance.target.invalidateSize();
                    }, 100);
                }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Historical Trace Path of Provider */}
                {providerPath.length > 1 && (
                    <Polyline positions={providerPath} color="#ef4444" weight={2} opacity={0.5} dashArray="5, 10" />
                )}

                {/* Main connecting line between current positions */}
                {isValidLoc(customerLoc) && isValidLoc(providerLoc) && (
                    <>
                        <Polyline positions={[customerLoc, providerLoc]} color="#0d9488" dashArray="5, 10" weight={4} opacity={0.8} />
                        <UpdateBounds points={[customerLoc, providerLoc]} />
                    </>
                )}

                {isValidLoc(customerLoc) && (
                    <Marker position={customerLoc} icon={customerIcon}>
                        <Popup>Customer Location</Popup>
                    </Marker>
                )}

                {isValidLoc(providerLoc) && (
                    <Marker position={providerLoc} icon={providerIcon}>
                        <Popup>Provider Location</Popup>
                    </Marker>
                )}
            </MapContainer>

            <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
                {distance && (
                    <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-teal-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-gray-900">{distance} km away</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl border border-gray-100 z-[1000] text-[11px] text-gray-600 flex flex-col gap-2 min-w-[120px]">
                <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">Live Map Legend</div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                    <span className="font-medium">Customer</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200"></div>
                    <span className="font-medium">Provider</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-6 h-[2px] bg-teal-600/50 dashed border-t border-teal-600 border-dashed"></div>
                    <span className="font-medium text-[10px]">Direct Path</span>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingMap;
