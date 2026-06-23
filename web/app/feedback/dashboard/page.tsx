"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Filter } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useSocket } from "@/hooks/useSocket";
import { useAppStore } from "@/store/appStore";
import { formatTimeAgo } from "@/lib/utils";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";

export default function FeedbackDashboard() {
  useSocket();
  const { branches, feedbacks } = useAppStore();
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<number>(0);

  const filtered = feedbacks.filter((f) => {
    if (filterBranch !== "all" && f.branchId !== filterBranch) return false;
    if (filterRating > 0 && f.rating !== filterRating) return false;
    return true;
  });

  const avgRating = filtered.length > 0
    ? (filtered.reduce((s, f) => s + f.rating, 0) / filtered.length).toFixed(1)
    : "–";

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: `${r} ⭐`,
    count: filtered.filter((f) => f.rating === r).length,
  }));

  const employeeStats = useMemo(() => {
    const map = new Map<string, { name: string; branchName: string; totalRating: number; count: number }>();
    filtered.forEach((f) => {
      const key = f.employeeId;
      const existing = map.get(key);
      if (existing) {
        existing.totalRating += f.rating;
        existing.count += 1;
      } else {
        map.set(key, { name: f.employeeName, branchName: f.branchName, totalRating: f.rating, count: 1 });
      }
    });
    return Array.from(map.values())
      .map((v) => ({ ...v, avg: parseFloat((v.totalRating / v.count).toFixed(1)) }))
      .sort((a, b) => b.avg - a.avg);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/analytics" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black">Dashboard Phản Hồi</h1>
              <p className="text-xs text-white/40">{feedbacks.length} đánh giá tổng cộng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <Link href="/feedback" className="text-sm bg-dookki-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-dookki-red-dark transition-colors">
              + Gửi Đánh Giá
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-white/30" />
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="h-9 px-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-dookki-red"
          >
            <option value="all">Tất cả chi nhánh</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex gap-1">
            {[0, 5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRating(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterRating === r ? "bg-dookki-red text-white" : "bg-white/10 text-white/50 hover:bg-white/20"
                }`}
              >
                {r === 0 ? "Tất cả" : `${r}⭐`}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng Đánh Giá", value: filtered.length, color: "text-white" },
            { label: "Điểm TB", value: avgRating, color: "text-yellow-400" },
            { label: "5 Sao", value: filtered.filter((f) => f.rating === 5).length, color: "text-green-400" },
            { label: "1-2 Sao", value: filtered.filter((f) => f.rating <= 2).length, color: "text-red-400" },
          ].map((k) => (
            <div key={k.label} className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className={`text-3xl font-black ${k.color}`}>{k.value}</div>
              <div className="text-xs text-white/40 mt-1">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating distribution */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <h3 className="font-bold mb-4">Phân Bổ Điểm Đánh Giá</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stars" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} width={55} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" name="Số lượng" fill="#E8212C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top employees */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <h3 className="font-bold mb-4">Nhân Viên Được Đánh Giá Cao</h3>
            {employeeStats.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">Chưa có đánh giá nào</div>
            ) : (
              <div className="space-y-3">
                {employeeStats.slice(0, 6).map((emp, i) => (
                  <div key={emp.name + i} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-white/60"
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{emp.name}</div>
                      <div className="text-xs text-white/30 truncate">{emp.branchName}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-yellow-400 font-black text-sm">⭐ {emp.avg}</div>
                      <div className="text-xs text-white/30">{emp.count} đánh giá</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT FEEDBACKS */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="font-bold mb-4">Đánh Giá Gần Đây</h3>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Chưa có đánh giá nào. Hãy thử tương tác với hệ thống!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...filtered].reverse().slice(0, 20).map((fb) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-9 h-9 rounded-full bg-dookki-red/20 border border-dookki-red/30 flex items-center justify-center font-bold text-dookki-red text-sm flex-shrink-0">
                    {fb.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{fb.customerName}</span>
                      <span className="text-white/20">→</span>
                      <span className="text-white/60 text-sm">{fb.employeeName}</span>
                      <span className="text-yellow-400 text-sm font-bold">{"⭐".repeat(fb.rating)}</span>
                    </div>
                    {fb.comment && <p className="text-sm text-white/50 mt-1">{fb.comment}</p>}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-white/20">
                      <span>{fb.branchName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(fb.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
