import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, X, ChevronDown } from "lucide-react";

const AddressSearch = ({ value, onChange, onSelect }) => {
    const [query, setQuery] = useState(value || "");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    useEffect(() => {
        // Get user's current location to bias search results (like Uber/Rapido)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => console.log("Geolocation error:", error),
                { enableHighAccuracy: true }
            );
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // Using Nominatim with very high biasing for local results
            // We use a broader limit and filter specifically for Indian locations
            let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                searchQuery
            )}&addressdetails=1&limit=15&countrycodes=in&viewbox=68.1,6.5,97.4,35.5`;

            if (userLocation) {
                url += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            const results = data.map(item => {
                const addr = item.address;
                // Priority list for the main name (most specific part)
                const mainName = addr.amenity || addr.building || addr.house_name || addr.office || addr.shop || addr.road || addr.display_name.split(',')[0];

                // Construct a robust subtitle that always includes area context
                const subParts = [];

                // If the main name is a building/shop, include the road as the first area part
                if ((addr.amenity || addr.building || addr.house_name || addr.office || addr.shop) && addr.road) {
                    subParts.push(addr.road);
                }

                // Add area components in order of specificity
                if (addr.neighbourhood && addr.neighbourhood !== mainName && !subParts.includes(addr.neighbourhood)) subParts.push(addr.neighbourhood);
                if (addr.suburb && addr.suburb !== mainName && !subParts.includes(addr.suburb)) subParts.push(addr.suburb);
                if (addr.city_district && addr.city_district !== mainName && !subParts.includes(addr.city_district)) subParts.push(addr.city_district);
                if (addr.town && addr.town !== mainName && !subParts.includes(addr.town)) subParts.push(addr.town);
                if (addr.village && addr.village !== mainName && !subParts.includes(addr.village)) subParts.push(addr.village);
                if (addr.city && addr.city !== mainName && !subParts.includes(addr.city)) subParts.push(addr.city);
                if (addr.state && addr.state !== mainName && !subParts.includes(addr.state)) subParts.push(addr.state);

                return {
                    display_name: item.display_name,
                    name: mainName,
                    subTitle: subParts.length > 0 ? subParts.join(", ") : "India",
                    lat: item.lat,
                    lon: item.lon
                };
            });

            setSuggestions(results);
            setShowDropdown(true);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        onChange(newQuery);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (newQuery.length >= 2) {
            setShowDropdown(true);
            timeoutRef.current = setTimeout(() => {
                fetchSuggestions(newQuery);
            }, 300); // Very fast response like Ola/Uber
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (item) => {
        setQuery(item.display_name);
        setShowDropdown(false);
        onSelect({
            address: item.display_name,
            lat: item.lat,
            lon: item.lon,
        });
    };

    const handleUseCurrentLocation = () => {
        if (userLocation) {
            // Reverse geocode to get address for current location
            setLoading(true);
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lon}`)
                .then(res => res.json())
                .then(data => {
                    const addr = data.display_name;
                    setQuery(addr);
                    onSelect({ address: addr, lat: userLocation.lat, lon: userLocation.lon });
                    setShowDropdown(false);
                })
                .finally(() => setLoading(false));
        } else {
            // Trigger permission request
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => alert("Please enable location to use this feature.")
            );
        }
    };

    const clearInput = () => {
        setQuery("");
        onChange("");
        setSuggestions([]);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin size={20} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    onClick={() => setShowDropdown(true)}
                    placeholder="Search for area, apartment or landmark..."
                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 cursor-pointer"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 group">
                    {loading ? (
                        <Loader2 size={18} className="animate-spin text-gray-400" />
                    ) : query ? (
                        <button
                            onClick={clearInput}
                            type="button"
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`p-1 text-gray-400 hover:text-gray-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>
            </div>

            {showDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn origin-top">
                    <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                        {/* Current Location Option */}
                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            className="w-full text-left px-5 py-4 hover:bg-blue-50 flex items-center gap-4 transition-colors border-b border-gray-100 group"
                        >
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Search size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-blue-600">Use current location</div>
                                <div className="text-xs text-blue-400">Using GPS for better accuracy</div>
                            </div>
                        </button>

                        {suggestions.map((item, index) => {
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-start gap-4 transition-colors border-b border-gray-50 last:border-0 group"
                                >
                                    <div className="mt-1 bg-gray-100 p-2 rounded-lg text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-bold text-gray-900 truncate text-base">
                                            {item.name}
                                        </div>
                                        <div className="text-sm text-gray-500 line-clamp-2 mt-0.5 font-medium">
                                            {item.subTitle}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {loading && suggestions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Loader2 size={32} className="animate-spin mb-3 text-blue-500 opacity-50" />
                                <p className="text-sm font-medium">Searching for locations...</p>
                            </div>
                        )}

                        {!loading && query.length >= 2 && suggestions.length === 0 && (
                            <div className="px-5 py-10 text-center text-gray-400">
                                <Search size={28} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-semibold text-gray-500">No specific matches found</p>
                                <p className="text-xs mt-1">Try searching for the main road or area instead (e.g. "Gamharia Jamshedpur")</p>
                            </div>
                        )}
                    </div>
                    {/* Yellow highlight bar at bottom as seen in image */}
                    <div className="h-1.5 bg-amber-400 w-full"></div>
                </div>
            )}
        </div>
    );
};

export default AddressSearch;
