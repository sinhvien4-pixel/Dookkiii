import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Branch, BranchStats, Table, UserLocation } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBranchStats(branch: Branch): BranchStats {
  const tables = branch.tables;
  const available = tables.filter((t) => t.status === "available").length;
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const cleaning = tables.filter((t) => t.status === "cleaning").length;
  const waiting = branch.waitingQueue.length;
  const occupancyRate = tables.length > 0 ? Math.round((occupied / tables.length) * 100) : 0;

  const estimatedWait = available === 0 && waiting > 0
    ? Math.max(15, Math.floor(waiting * 12))
    : waiting > 0
    ? Math.max(5, Math.floor(waiting * 5))
    : 0;

  return {
    totalTables: tables.length,
    availableTables: available,
    occupiedTables: occupied,
    cleaningTables: cleaning,
    waitingCount: waiting,
    estimatedWaitMinutes: estimatedWait,
    occupancyRate,
  };
}

export function getTableRemainingMinutes(table: Table): number {
  if (!table.startTime || table.status !== "occupied") return 0;
  const elapsed = (Date.now() - new Date(table.startTime).getTime()) / 60000;
  return Math.max(0, Math.round(table.maxDiningMinutes - elapsed));
}

export function getTableElapsedMinutes(table: Table): number {
  if (!table.startTime || table.status !== "occupied") return 0;
  const elapsed = (Date.now() - new Date(table.startTime).getTime()) / 60000;
  return Math.min(table.maxDiningMinutes, Math.round(elapsed));
}

export function getTimerColor(remaining: number): string {
  if (remaining > 60) return "text-green-400";
  if (remaining > 20) return "text-yellow-400";
  return "text-red-400";
}

export function getTimerBg(remaining: number): string {
  if (remaining > 60) return "bg-green-500";
  if (remaining > 20) return "bg-yellow-500";
  return "bg-red-500";
}

export function getStatusVi(status: Table["status"]): string {
  const map: Record<Table["status"], string> = {
    available: "Trống",
    occupied: "Đang sử dụng",
    cleaning: "Đang dọn dẹp",
  };
  return map[status];
}

export function getStatusColor(status: Table["status"]): string {
  const map: Record<Table["status"], string> = {
    available: "bg-green-500 text-white",
    occupied: "bg-red-500 text-white",
    cleaning: "bg-yellow-500 text-black",
  };
  return map[status];
}

export function getStatusBorder(status: Table["status"]): string {
  const map: Record<Table["status"], string> = {
    available: "border-green-500",
    occupied: "border-red-500",
    cleaning: "border-yellow-400",
  };
  return map[status];
}

export function calculateDistance(from: UserLocation, to: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function formatWaitTime(minutes: number): string {
  if (minutes === 0) return "Không phải chờ";
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}g ${m} phút` : `${h} giờ`;
}

export function formatTimeAgo(isoString: string): string {
  const diff = (Date.now() - new Date(isoString).getTime()) / 60000;
  if (diff < 1) return "Vừa xong";
  if (diff < 60) return `${Math.round(diff)} phút trước`;
  return `${Math.round(diff / 60)} giờ trước`;
}

export function getStarRatingAvg(totalRating: number, feedbackCount: number): number {
  if (feedbackCount === 0) return 0;
  return parseFloat((totalRating / feedbackCount).toFixed(1));
}
