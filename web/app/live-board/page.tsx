"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/appStore";
import { getBranchStats, getTableRemainingMinutes, getStatusVi, getTimerColor } from "@/lib/utils";
import { Branch, Table } from "@/types";

export default function LiveBoardPage() {
  const { branches } = useAppStore();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [showPicker, setShowPicker] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const currentBranch = branches.find((b) => b.id === selectedBranchId);

  if (showPicker || !currentBranch) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <div className="text-center mb-10">
          <div className="text-4xl font-black text-dookki-red mb-2">DOOKKI LIVE BOARD</div>
          <p className="text-white/50">Chọn chi nhánh để hiển thị trên màn hình TV</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {branches.map((branch) => {
            const stats = getBranchStats(branch);
            return (
              <button
                key={branch.id}
                onClick={() => { setSelectedBranchId(branch.id); setShowPicker(false); }}
                className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-dookki-red/50 hover:bg-dookki-red/10 text-left transition-all"
              >
                <div className="font-bold text-white text-sm mb-2 leading-tight">{branch.name}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400 font-bold">{stats.availableTables} trống</span>
                  <span className="text-white/20">•</span>
                  <span className="text-red-400">{stats.occupiedTables} dùng</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const stats = getBranchStats(currentBranch);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden select-none font-mono">
      {/* TOP HEADER - FIDS style */}
      <div className="bg-black border-b-2 border-dookki-red px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-dookki-red tracking-widest">DOOKKI</span>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <div className="text-white font-bold text-lg tracking-wide">{currentBranch.name.toUpperCase()}</div>
            <div className="text-white/40 text-xs tracking-widest">{currentBranch.address.toUpperCase()}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black tracking-widest tabular-nums text-white">
            {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-white/40 text-xs tracking-widest">
            {now.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase()}
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="bg-dookki-red/10 border-b border-dookki-red/30 px-6 py-3 flex items-center gap-8">
        {[
          { label: "TỔNG SỐ BÀN", value: stats.totalTables, color: "text-white" },
          { label: "BÀN TRỐNG", value: stats.availableTables, color: "text-green-400" },
          { label: "ĐANG SỬ DỤNG", value: stats.occupiedTables, color: "text-red-400" },
          { label: "ĐANG DỌN", value: stats.cleaningTables, color: "text-yellow-400" },
          { label: "KHÁCH CHỜ", value: stats.waitingCount, color: "text-blue-400" },
          {
            label: "THỜI GIAN CHỜ",
            value: stats.estimatedWaitMinutes === 0 ? "0 PHÚT" : `~${stats.estimatedWaitMinutes} PHÚT`,
            color: stats.estimatedWaitMinutes === 0 ? "text-green-400" : "text-yellow-400",
          },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center min-w-[80px]">
            <span className={`text-3xl font-black tabular-nums ${s.color}`}>{s.value}</span>
            <span className="text-white/30 text-xs tracking-widest mt-0.5">{s.label}</span>
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="tracking-widest font-bold">TRỰC TIẾP</span>
        </div>

        <button
          onClick={() => setShowPicker(true)}
          className="text-white/20 hover:text-white/60 text-xs tracking-widest transition-colors"
        >
          ⚙ ĐỔI CN
        </button>
      </div>

      {/* TABLE GRID */}
      <div className="p-6">
        <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3">
          {currentBranch.tables.map((table, i) => (
            <FIDSTableCard key={table.id} table={table} index={i} />
          ))}
        </div>
      </div>

      {/* WAITING QUEUE */}
      {currentBranch.waitingQueue.length > 0 && (
        <div className="px-6 pb-6">
          <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-white font-black tracking-widest text-sm uppercase">
                Hàng Đợi — {currentBranch.waitingQueue.length} Nhóm Khách
              </span>
            </div>
            <div className="p-4 flex gap-3 flex-wrap">
              {currentBranch.waitingQueue.map((customer, i) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-400 text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-white font-semibold text-sm">{customer.name}</span>
                  <span className="text-blue-400/60 text-xs">{customer.partySize} người</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TICKER */}
      <div className="fixed bottom-0 left-0 right-0 bg-dookki-red h-10 flex items-center overflow-hidden">
        <div className="ticker-text text-white font-bold text-sm tracking-wide whitespace-nowrap">
          {Array(5).fill(
            `🔴 ${currentBranch.name.toUpperCase()} &nbsp;|&nbsp; Giờ mở cửa: ${currentBranch.openHours} &nbsp;|&nbsp; ${stats.availableTables > 0 ? `✅ CÒN ${stats.availableTables} BÀN TRỐNG` : "⚠️ HIỆN ĐANG KÍN BÀN"} &nbsp;|&nbsp; Khách đang chờ: ${stats.waitingCount} người &nbsp;|&nbsp; Thời gian chờ ước tính: ${stats.estimatedWaitMinutes === 0 ? "Không phải chờ" : `~${stats.estimatedWaitMinutes} phút`} &nbsp;|&nbsp; `
          ).join("")}
        </div>
      </div>
    </div>
  );
}

function FIDSTableCard({ table, index }: { table: Table; index: number }) {
  const remaining = getTableRemainingMinutes(table);
  const elapsed = table.startTime && table.status === "occupied"
    ? Math.round((Date.now() - new Date(table.startTime).getTime()) / 60000)
    : 0;

  const bgMap: Record<Table["status"], string> = {
    available: "bg-green-950 border-green-500",
    occupied: "bg-red-950 border-red-500",
    cleaning: "bg-yellow-950 border-yellow-500",
    reserved: "bg-blue-950 border-blue-500",
  };

  const headerMap: Record<Table["status"], string> = {
    available: "bg-green-500",
    occupied: "bg-red-500",
    cleaning: "bg-yellow-500",
    reserved: "bg-blue-500",
  };

  const textMap: Record<Table["status"], string> = {
    available: "text-green-300",
    occupied: "text-red-300",
    cleaning: "text-yellow-300",
    reserved: "text-blue-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl border-2 overflow-hidden ${bgMap[table.status]}`}
    >
      <div className={`${headerMap[table.status]} px-2 py-1 flex items-center justify-between`}>
        <span className="text-black font-black text-xs tracking-widest">
          BÀN {String(table.number).padStart(2, "0")}
        </span>
        {table.status === "occupied" && table.guests > 0 && (
          <span className="text-black/70 text-xs font-bold">{table.guests}K</span>
        )}
      </div>

      <div className="p-2 space-y-1">
        <div className={`text-xs font-bold tracking-wide ${textMap[table.status]} truncate`}>
          {getStatusVi(table.status).toUpperCase()}
        </div>

        {table.status === "occupied" && (
          <>
            <div className={`text-lg font-black tabular-nums ${getTimerColor(remaining)}`}>
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
            </div>
            <div className="h-1 bg-black/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${remaining > 60 ? "bg-green-400" : remaining > 20 ? "bg-yellow-400" : "bg-red-400"}`}
                style={{ width: `${Math.min(100, (elapsed / table.maxDiningMinutes) * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
