"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Users, Navigation, RefreshCw, ArrowLeft, Map, Star } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAppStore } from "@/store/appStore";
import {
  getBranchStats, calculateDistance, formatWaitTime, getStatusVi,
  getTableRemainingMinutes, getTableElapsedMinutes, getTimerColor,
} from "@/lib/utils";
import { TableStatusBadge } from "@/components/shared/TableStatusBadge";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { Branch, BranchWithDistance, UserLocation } from "@/types";

export default function CustomerPage() {
  useSocket();
  const { branches } = useAppStore();
  const { location, loading: locLoading } = useGeolocation();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "waiting">("all");

  const branchesWithDistance: BranchWithDistance[] = branches.map((b) => ({
    ...b,
    distanceKm: location ? calculateDistance(location, b.coordinates) : 0,
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const filtered = branchesWithDistance.filter((b) => {
    const stats = getBranchStats(b);
    if (filter === "available") return stats.availableTables > 0;
    if (filter === "waiting") return stats.waitingCount > 0;
    return true;
  });

  const expandedBranch = selectedBranch
    ? branchesWithDistance.find((b) => b.id === selectedBranch)
    : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/select" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">Tìm Bàn Trống</h1>
              <p className="text-xs text-white/40">Cập nhật thời gian thực</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/feedback"
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:block">Đánh Giá</span>
            </Link>
            <Link href="/map" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5">
              <Map className="w-4 h-4" />
              <span className="hidden sm:block">Bản Đồ</span>
            </Link>
            <ConnectionStatus />
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-2">
          {(["all", "available", "waiting"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-dookki-red text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f === "all" ? "Tất Cả" : f === "available" ? "Còn Bàn" : "Có Hàng Đợi"}
            </button>
          ))}
          {locLoading && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-white/40">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Đang định vị...
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {branches.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((branch, i) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                index={i}
                location={location}
                selected={selectedBranch === branch.id}
                onSelect={() => setSelectedBranch(selectedBranch === branch.id ? null : branch.id)}
              />
            ))}
          </div>
        )}

        {branches.length > 0 && <SmartRecommendation branches={branchesWithDistance} />}
      </div>

      <AnimatePresence>
        {expandedBranch && (
          <BranchDetailPanel
            branch={expandedBranch}
            location={location}
            onClose={() => setSelectedBranch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BranchCard({
  branch,
  index,
  location,
  selected,
  onSelect,
}: {
  branch: BranchWithDistance;
  index: number;
  location: UserLocation | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const stats = getBranchStats(branch);

  // Build Google Maps navigation URL — include user's GPS as origin when available
  const directionsUrl = location
    ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${branch.coordinates.lat},${branch.coordinates.lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}&travelmode=driving`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={`group relative rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
        selected
          ? "border-dookki-red bg-dookki-red/10"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      {/* Image header */}
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={branch.imageUrl}
          alt={branch.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              stats.availableTables > 3
                ? "bg-green-500/90 text-white"
                : stats.availableTables > 0
                ? "bg-yellow-500/90 text-black"
                : "bg-red-500/90 text-white"
            }`}
          >
            {stats.availableTables > 0 ? `${stats.availableTables} bàn trống` : "Hết bàn"}
          </span>
        </div>
        <div className="absolute bottom-3 left-4">
          <h3 className="font-black text-white text-lg leading-tight">{branch.name}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-sm text-white/50">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-dookki-red" />
          <span className="truncate">{branch.address}</span>
        </div>

        {branch.distanceKm > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-white/50">
            <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{branch.distanceKm} km từ bạn</span>
          </div>
        )}

        {/* Table stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-lg font-black text-green-400">{stats.availableTables}</div>
            <div className="text-xs text-white/40">Trống</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-lg font-black text-red-400">{stats.occupiedTables}</div>
            <div className="text-xs text-white/40">Đang dùng</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-lg font-black text-yellow-400">{stats.cleaningTables}</div>
            <div className="text-xs text-white/40">Dọn dẹp</div>
          </div>
        </div>

        {/* Wait time & queue */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-white/40" />
            <span
              className={
                stats.estimatedWaitMinutes === 0
                  ? "text-green-400 font-semibold"
                  : "text-yellow-400 font-semibold"
              }
            >
              {formatWaitTime(stats.estimatedWaitMinutes)}
            </span>
          </div>
          {stats.waitingCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <Users className="w-3.5 h-3.5" />
              {stats.waitingCount} khách đang chờ
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/30">
            <span>Lấp đầy</span>
            <span>{stats.occupancyRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.occupancyRate > 80
                  ? "bg-red-500"
                  : stats.occupancyRate > 50
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Action row: detail toggle + navigation */}
        <div className="flex gap-2 mt-1">
          <button className="flex-1 py-2 rounded-lg border border-dookki-red/30 text-dookki-red text-sm font-semibold hover:bg-dookki-red hover:text-white transition-all">
            {selected ? "Ẩn chi tiết" : "Xem bàn"}
          </button>
          {/* "Chỉ đường" — stopPropagation so the card's onSelect does not also fire */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white/60 text-sm font-semibold hover:bg-dookki-red hover:text-white hover:border-dookki-red transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            Chỉ đường
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function BranchDetailPanel({
  branch,
  location,
  onClose,
}: {
  branch: BranchWithDistance;
  location: UserLocation | null;
  onClose: () => void;
}) {
  // 1-second interval so the MM:SS countdown ticks every second like a flight board
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const occupiedTables = branch.tables.filter((t) => t.status === "occupied" && t.startTime);

  const directionsUrl = location
    ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${branch.coordinates.lat},${branch.coordinates.lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}&travelmode=driving`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-gray-900 border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black">{branch.name}</h2>
            <p className="text-white/50 text-sm mt-1">{branch.address}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Table grid — occupied cells show remaining minutes */}
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wide mb-3">
          Sơ Đồ Bàn ({branch.totalTables} bàn)
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
          {branch.tables.map((table) => {
            const remaining = table.status === "occupied" && table.startTime
              ? getTableRemainingMinutes(table)
              : null;
            return (
              <div
                key={table.id}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all ${
                  table.status === "available"
                    ? "border-green-500/50 bg-green-500/10"
                    : table.status === "occupied"
                    ? "border-red-500/50 bg-red-500/10"
                    : table.status === "cleaning"
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-blue-500/50 bg-blue-500/10"
                }`}
              >
                <span className="text-xs font-black">
                  {String(table.number).padStart(2, "0")}
                </span>
                <span
                  className={`text-xs mt-0.5 font-semibold ${
                    remaining !== null
                      ? getTimerColor(remaining)
                      : table.status === "available"
                      ? "text-green-400"
                      : table.status === "cleaning"
                      ? "text-yellow-400"
                      : "text-blue-400"
                  }`}
                >
                  {remaining !== null
                    ? `${remaining}p`
                    : table.guests > 0
                    ? `${table.guests}K`
                    : getStatusVi(table.status).slice(0, 5)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Occupied table countdown — MM:SS format, ticks every second */}
        {occupiedTables.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wide mb-3">
              Bàn Đang Sử Dụng ({occupiedTables.length} bàn)
            </h3>
            <div className="space-y-2 mb-6">
              {occupiedTables.map((table) => {
                // Compute at millisecond resolution for true per-second countdown
                const remainingMs = table.startTime
                  ? Math.max(0, table.maxDiningMinutes * 60 * 1000 - (Date.now() - new Date(table.startTime).getTime()))
                  : 0;
                const totalSeconds = Math.floor(remainingMs / 1000);
                const displayMins = Math.floor(totalSeconds / 60);
                const displaySecs = totalSeconds % 60;
                const countdown = `${String(displayMins).padStart(2, "0")}:${String(displaySecs).padStart(2, "0")}`;

                const elapsed = getTableElapsedMinutes(table);
                const remaining = getTableRemainingMinutes(table);

                return (
                  <div key={table.id} className="p-3 rounded-xl bg-white/5 border border-red-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">
                        Bàn {String(table.number).padStart(2, "0")} — {table.guests} khách
                      </span>
                      {/* MM:SS countdown — updates every 1 second via setInterval above */}
                      <span className={`text-lg font-black tabular-nums tracking-widest ${getTimerColor(remaining)}`}>
                        {countdown}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                      <span>Đã sử dụng: {elapsed}/{table.maxDiningMinutes} phút</span>
                      <span className={getTimerColor(remaining)}>Còn {remaining} phút</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          remaining > 60 ? "bg-green-500" : remaining > 20 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, (elapsed / table.maxDiningMinutes) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Queue */}
        {branch.waitingQueue.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wide mb-3">
              Hàng Đợi ({branch.waitingQueue.length} người)
            </h3>
            <div className="space-y-2">
              {branch.waitingQueue.map((customer, i) => (
                <div key={customer.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-dookki-red/20 text-dookki-red text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">{customer.name}</span>
                  <span className="text-xs text-white/40">{customer.partySize} người</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 flex gap-3">
          {/* Navigation URL includes user GPS as origin when available */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-dookki-red text-white font-bold text-sm hover:bg-dookki-red-dark transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Chỉ Đường
          </a>
          <Link
            href="/feedback"
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-yellow-500/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/10 transition-colors"
          >
            <Star className="w-4 h-4" />
            Đánh Giá
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-white/20 text-white/60 text-sm hover:bg-white/10 transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SmartRecommendation({ branches }: { branches: BranchWithDistance[] }) {
  const busyBranches = branches.filter((b) => {
    const stats = getBranchStats(b);
    return stats.occupancyRate > 80 || stats.waitingCount > 5;
  });

  if (busyBranches.length === 0) return null;

  const recommend = branches
    .filter((b) => {
      const stats = getBranchStats(b);
      return stats.availableTables >= 3 && stats.waitingCount === 0;
    })
    .slice(0, 2);

  if (recommend.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-400 text-lg">💡</span>
        <h3 className="font-bold text-yellow-400">Gợi Ý Thông Minh</h3>
      </div>
      <p className="text-white/60 text-sm mb-4">
        Một số chi nhánh đang đông khách. Bạn nên đến:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recommend.map((branch) => {
          const stats = getBranchStats(branch);
          return (
            <div key={branch.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="font-bold text-white mb-1">{branch.name}</div>
              <div className="text-sm text-white/50">{branch.distanceKm} km từ bạn</div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-green-400 text-sm font-semibold">
                  {stats.availableTables} bàn trống
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/50 text-sm">Không cần chờ</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
