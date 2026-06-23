"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, MapPin, Clock, Users, X } from "lucide-react";
import Link from "next/link";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAppStore } from "@/store/appStore";
import { getBranchStats, calculateDistance, formatWaitTime } from "@/lib/utils";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { Branch } from "@/types";

export default function MapPage() {
  const { branches } = useAppStore();
  const { location, error: locationError } = useGeolocation();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const userMarkerRef = useRef<unknown>(null);

  // Initialize map once
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let mounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mounted || !mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        center: [21.0245, 105.8412],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstance.current = map;
    };

    initMap();
    return () => { mounted = false; };
  }, []);

  // Update branch markers whenever branches data changes
  useEffect(() => {
    if (!mapInstance.current || typeof window === "undefined" || branches.length === 0) return;

    import("leaflet").then((mod) => {
      const L = mod.default;
      const map = mapInstance.current as import("leaflet").Map;

      // Remove stale branch markers
      markersRef.current.forEach((m) => (m as import("leaflet").Marker).remove());
      markersRef.current = [];

      const dookkiIcon = L.divIcon({
        html: `<div style="background:#E8212C;border:3px solid white;border-radius:50% 50% 50% 0;width:32px;height:32px;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(232,33,44,0.5)"></div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      branches.forEach((branch) => {
        const stats = getBranchStats(branch);
        const marker = L.marker([branch.coordinates.lat, branch.coordinates.lng], { icon: dookkiIcon })
          .addTo(map)
          .bindTooltip(
            `<b>${branch.name}</b><br>${stats.availableTables > 0 ? `✅ ${stats.availableTables} bàn trống` : "❌ Hết bàn"}`,
            { permanent: false }
          )
          .on("click", () => setSelectedBranch(branch));
        markersRef.current.push(marker);
      });
    });
  }, [branches]);

  // Place/update user location marker — remove duplicate before adding new one
  useEffect(() => {
    if (!location || !mapInstance.current || typeof window === "undefined") return;

    import("leaflet").then((mod) => {
      const L = mod.default;
      const map = mapInstance.current as import("leaflet").Map;

      // Remove previous user marker to prevent duplicates
      if (userMarkerRef.current) {
        (userMarkerRef.current as import("leaflet").Marker).remove();
        userMarkerRef.current = null;
      }

      const userIcon = L.divIcon({
        html: `<div style="background:#3b82f6;border:3px solid white;border-radius:50%;width:16px;height:16px;box-shadow:0 0 0 6px rgba(59,130,246,0.25)"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([location.lat, location.lng], { icon: userIcon })
        .addTo(map)
        .bindTooltip("📍 Bạn đang ở đây", { permanent: true, direction: "top", offset: [0, -12] });

      userMarkerRef.current = marker;

      // Pan map to user location
      map.flyTo([location.lat, location.lng], 13, { duration: 1.5 });
    });
  }, [location]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customer" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black">Bản Đồ Chi Nhánh</h1>
              <p className="text-xs text-white/40">8 chi nhánh tại Hà Nội</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {location && !locationError && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded-lg px-3 py-1.5">
                📍 Đã định vị
              </span>
            )}
            {locationError && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 rounded-lg px-3 py-1.5">
                ⚠️ Không xác định được vị trí
              </span>
            )}
            <ConnectionStatus />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: "60vh" }}>
        <div ref={mapRef} className="absolute inset-0 z-0" />

        {/* Branch list sidebar */}
        <div className="absolute top-4 left-4 z-10 w-72 max-h-[calc(100vh-200px)] overflow-y-auto space-y-2 hidden lg:block">
          {branches.map((branch) => {
            const stats = getBranchStats(branch);
            const dist = location ? calculateDistance(location, branch.coordinates) : null;
            // Build navigation URL with user GPS as origin when available
            const directionsUrl = location
              ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${branch.coordinates.lat},${branch.coordinates.lng}&travelmode=driving`
              : `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}&travelmode=driving`;

            return (
              // Changed from motion.button to motion.div so we can nest an <a> inside
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 hover:border-dookki-red/50 transition-all overflow-hidden"
              >
                {/* Clickable info area — opens detail popup */}
                <button
                  onClick={() => setSelectedBranch(branch)}
                  className="w-full text-left p-3"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-bold text-sm leading-tight">{branch.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                      stats.availableTables > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {stats.availableTables > 0 ? `${stats.availableTables} trống` : "Hết bàn"}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 mb-1.5">{branch.address}</div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    {dist !== null && <span><Navigation className="w-3 h-3 inline mr-1" />{dist} km</span>}
                    {stats.waitingCount > 0 && <span><Users className="w-3 h-3 inline mr-1" />{stats.waitingCount} chờ</span>}
                  </div>
                </button>
                {/* "Chỉ đường" button — opens Google Maps with GPS origin → branch destination */}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 border-t border-white/10 text-xs text-white/50 hover:bg-dookki-red hover:text-white hover:border-dookki-red transition-all font-semibold"
                >
                  <Navigation className="w-3 h-3" />
                  Chỉ đường
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Branch Detail Popup */}
      <AnimatePresence>
        {selectedBranch && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-white/10 rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-black">{selectedBranch.name}</h2>
                <p className="text-sm text-white/50 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedBranch.address}
                </p>
              </div>
              <button onClick={() => setSelectedBranch(null)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const stats = getBranchStats(selectedBranch);
              const dist = location ? calculateDistance(location, selectedBranch.coordinates) : null;
              // Navigation URL: origin = user GPS (if available), destination = branch coordinates
              const directionsUrl = location
                ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${selectedBranch.coordinates.lat},${selectedBranch.coordinates.lng}&travelmode=driving`
                : `https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.coordinates.lat},${selectedBranch.coordinates.lng}&travelmode=driving`;

              return (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="text-2xl font-black text-green-400">{stats.availableTables}</div>
                      <div className="text-xs text-white/40">Bàn trống</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="text-2xl font-black text-red-400">{stats.occupiedTables}</div>
                      <div className="text-xs text-white/40">Đang dùng</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-2xl font-black text-blue-400">{stats.waitingCount}</div>
                      <div className="text-xs text-white/40">Khách chờ</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-white/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Chờ: <b className="text-white">{formatWaitTime(stats.estimatedWaitMinutes)}</b></span>
                    </div>
                    {dist !== null && (
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4" />
                        <span>Cách bạn: <b className="text-white">{dist} km</b></span>
                      </div>
                    )}
                  </div>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-dookki-red hover:bg-dookki-red-dark text-white font-bold transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Chỉ Đường Đến Đây
                  </a>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
