"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ChefHat, ArrowLeft, ArrowRight } from "lucide-react";

export default function SelectPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dookki-red/10 via-black to-black" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-5xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay về trang chủ
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-3xl font-black text-dookki-red tracking-tight">DOOKKI</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2 mb-3">
            Bạn là ai?
          </h1>
          <p className="text-white/50 mb-12">Chọn vai trò để tiếp tục</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CUSTOMER CARD */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link href="/customer">
              <div className="group relative p-10 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-dookki-red/40 transition-all duration-300 cursor-pointer overflow-hidden text-left">
                {/* BG Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-dookki-red/10 to-transparent" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-dookki-red/20 border border-dookki-red/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-dookki-red" />
                  </div>

                  <h2 className="text-3xl font-black text-white mb-3">KHÁCH HÀNG</h2>
                  <p className="text-white/50 leading-relaxed mb-8">
                    Xem trạng thái bàn theo thời gian thực, ước tính thời gian chờ,
                    và tìm chi nhánh gần nhất còn bàn trống.
                  </p>

                  <ul className="space-y-2 mb-8 text-sm text-white/60">
                    {[
                      "Xem bàn trống tất cả chi nhánh",
                      "Tính khoảng cách từ vị trí của bạn",
                      "Gợi ý chi nhánh thay thế khi đông",
                      "Theo dõi hàng đợi thời gian thực",
                      "Đánh giá nhân viên phục vụ",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-dookki-red flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 text-dookki-red font-bold group-hover:gap-4 transition-all">
                    Vào ứng dụng khách hàng
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* STAFF CARD */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link href="/staff/login">
              <div className="group relative p-10 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer overflow-hidden text-left">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-3xl font-black text-white mb-3">NHÂN VIÊN</h2>
                  <p className="text-white/50 leading-relaxed mb-8">
                    Quản lý bàn, cập nhật trạng thái, quản lý hàng đợi và theo dõi
                    đồng hồ 90 phút cho từng bàn.
                  </p>

                  <ul className="space-y-2 mb-8 text-sm text-white/60">
                    {[
                      "Quản lý tất cả bàn trong ca",
                      "Bộ đếm thời gian 90 phút tự động",
                      "Quản lý hàng đợi khách chờ",
                      "Đồng bộ thời gian thực tất cả màn hình",
                      "Bảng live TV dành cho màn hình lớn",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                    Đăng nhập nhân viên
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Other links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-white/30"
        >
          <Link href="/live-board" className="hover:text-white/60 transition-colors">📺 Bảng Live TV</Link>
          <span>•</span>
          <Link href="/analytics" className="hover:text-white/60 transition-colors">📊 Thống Kê</Link>
          <span>•</span>
          <Link href="/map" className="hover:text-white/60 transition-colors">🗺️ Bản Đồ</Link>
        </motion.div>
      </div>
    </div>
  );
}
