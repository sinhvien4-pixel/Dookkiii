"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { ArrowLeft, TrendingUp, DollarSign, Users, Clock, Table2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { getBranchStats, formatWaitTime } from "@/lib/utils";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#3b82f6", "#8b5cf6"];

const MOCK_HOURLY = [
  { hour: "10h", khach: 12, ban: 3 },
  { hour: "11h", khach: 28, ban: 7 },
  { hour: "12h", khach: 85, ban: 15 },
  { hour: "13h", khach: 92, ban: 18 },
  { hour: "14h", khach: 56, ban: 11 },
  { hour: "15h", khach: 34, ban: 8 },
  { hour: "16h", khach: 41, ban: 9 },
  { hour: "17h", khach: 67, ban: 13 },
  { hour: "18h", khach: 95, ban: 18 },
  { hour: "19h", khach: 102, ban: 20 },
  { hour: "20h", khach: 88, ban: 17 },
  { hour: "21h", khach: 45, ban: 9 },
];

const MOCK_WEEKLY = [
  { day: "Thứ 2", doanhThu: 4500000 },
  { day: "Thứ 3", doanhThu: 5200000 },
  { day: "Thứ 4", doanhThu: 4800000 },
  { day: "Thứ 5", doanhThu: 6100000 },
  { day: "Thứ 6", doanhThu: 8900000 },
  { day: "Thứ 7", doanhThu: 12400000 },
  { day: "CN", doanhThu: 11200000 },
];

function formatVND(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ₫`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K ₫`;
  return `${n} ₫`;
}

export default function AnalyticsPage() {
  const { branches } = useAppStore();

  const globalStats = useMemo(() => {
    const total = { tables: 0, available: 0, occupied: 0, cleaning: 0, waiting: 0 };
    branches.forEach((b) => {
      const s = getBranchStats(b);
      total.tables += s.totalTables;
      total.available += s.availableTables;
      total.occupied += s.occupiedTables;
      total.cleaning += s.cleaningTables;
      total.waiting += s.waitingCount;
    });
    return total;
  }, [branches]);

  const occupancyRate = globalStats.tables > 0
    ? Math.round((globalStats.occupied / globalStats.tables) * 100)
    : 0;

  const branchPerf = branches.map((b) => {
    const s = getBranchStats(b);
    return {
      name: b.name.replace("Dookki ", ""),
      occupancy: s.occupancyRate,
      available: s.availableTables,
      waiting: s.waitingCount,
    };
  });

  const pieData = [
    { name: "Trống", value: globalStats.available },
    { name: "Đang dùng", value: globalStats.occupied },
    { name: "Dọn dẹp", value: globalStats.cleaning },
    { name: "Chờ", value: globalStats.waiting },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/select" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black">Thống Kê & Phân Tích</h1>
              <p className="text-xs text-white/40">Dữ liệu thời gian thực – Tất cả chi nhánh Hà Nội</p>
            </div>
          </div>
          <ConnectionStatus />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Table2, label: "Tổng Số Bàn", value: globalStats.tables, color: "text-white", sub: "8 chi nhánh" },
            { icon: TrendingUp, label: "Bàn Trống", value: globalStats.available, color: "text-green-400", sub: `${globalStats.tables - globalStats.available} đang bận` },
            { icon: Users, label: "Đang Phục Vụ", value: globalStats.occupied, color: "text-red-400", sub: `${occupancyRate}% lấp đầy` },
            { icon: RefreshCw, label: "Đang Dọn", value: globalStats.cleaning, color: "text-yellow-400", sub: "Sắp sẵn sàng" },
            { icon: Clock, label: "Khách Đang Chờ", value: globalStats.waiting, color: "text-blue-400", sub: "Tất cả chi nhánh" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className="w-4 h-4 text-white/30" />
                <span className="text-xs text-white/30">{card.sub}</span>
              </div>
              <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
              <div className="text-xs text-white/50 mt-1">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mock Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/5"
          >
            <h3 className="text-base font-bold mb-1">Doanh Thu Theo Ngày (Ước Tính)</h3>
            <p className="text-xs text-white/30 mb-4">Tổng tất cả chi nhánh trong tuần</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MOCK_WEEKLY}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8212C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8212C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={(v) => formatVND(v)} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  formatter={(v: number) => [formatVND(v), "Doanh Thu"]}
                />
                <Area type="monotone" dataKey="doanhThu" stroke="#E8212C" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl border border-white/10 bg-white/5"
          >
            <h3 className="text-base font-bold mb-1">Phân Bổ Bàn</h3>
            <p className="text-xs text-white/30 mb-4">Toàn bộ hệ thống</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-white/60">{d.name}</span>
                  </div>
                  <span className="font-bold text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* HOURLY TRAFFIC */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5"
        >
          <h3 className="text-base font-bold mb-1">Lưu Lượng Khách Theo Giờ (Hôm Nay)</h3>
          <p className="text-xs text-white/30 mb-4">Tất cả chi nhánh</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_HOURLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              <Bar dataKey="khach" name="Số Khách" fill="#E8212C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ban" name="Số Bàn Sử Dụng" fill="rgba(232,33,44,0.3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* BRANCH PERFORMANCE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5"
        >
          <h3 className="text-base font-bold mb-1">Hiệu Suất Từng Chi Nhánh</h3>
          <p className="text-xs text-white/30 mb-4">Tỷ lệ lấp đầy & số khách chờ</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Chi Nhánh", "Lấp Đầy", "Bàn Trống", "Khách Chờ", "Trạng Thái"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-white/40 font-semibold text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => {
                  const s = getBranchStats(branch);
                  return (
                    <tr key={branch.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold">{branch.name.replace("Dookki ", "")}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${s.occupancyRate > 80 ? "bg-red-500" : s.occupancyRate > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${s.occupancyRate}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${s.occupancyRate > 80 ? "text-red-400" : s.occupancyRate > 50 ? "text-yellow-400" : "text-green-400"}`}>
                            {s.occupancyRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-green-400 font-bold">{s.availableTables}</td>
                      <td className="py-3 px-4 text-blue-400 font-bold">{s.waitingCount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          s.availableTables > 0 ? "bg-green-500/20 text-green-400" :
                          s.waitingCount > 5 ? "bg-red-500/20 text-red-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {s.availableTables > 0 ? "Còn bàn" : s.waitingCount > 5 ? "Đông khách" : "Kín bàn"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
