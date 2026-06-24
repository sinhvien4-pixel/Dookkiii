"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, MapPin, Clock, BarChart3, Users, Star, ChevronDown } from "lucide-react";

const IMAGES = [
  "https://emdoi.vn/wp-content/uploads/2025/04/Dookki-Smart-City-7.webp",
  "https://halotravel.vn/wp-content/uploads/2020/04/dookki-ha-noi-3.jpg",
  "https://kenhhomestay.com/wp-content/uploads/2021/03/dookki-14.jpg",
  "https://dookkivietnam.vn/wp-content/uploads/2025/03/gia-ve-menu-dookki-vietnam.jpg",
];

const BRANCHES = [
  { name: "Royal City", tables: 12, district: "Thanh Xuân", wait: "5 phút" },
  { name: "Times City", tables: 18, district: "Hai Bà Trưng", wait: "15 phút" },
  { name: "Trần Duy Hưng", tables: 15, district: "Cầu Giấy", wait: "0 phút" },
  { name: "Skylake", tables: 10, district: "Nam Từ Liêm", wait: "0 phút" },
  { name: "Phạm Ngọc Thạch", tables: 14, district: "Đống Đa", wait: "10 phút" },
  { name: "MAC Plaza", tables: 11, district: "Hà Đông", wait: "0 phút" },
  { name: "Aeon Mall Hà Đông", tables: 20, district: "Hà Đông", wait: "20 phút" },
  { name: "Smart City", tables: 16, district: "Nam Từ Liêm", wait: "8 phút" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Cập Nhật Thời Gian Thực",
    desc: "Mọi thay đổi từ nhân viên hiển thị ngay lập tức trên tất cả màn hình. Không cần làm mới trang.",
  },
  {
    icon: MapPin,
    title: "Định Vị Thông Minh",
    desc: "Hệ thống tự động tính khoảng cách và đề xuất chi nhánh gần nhất còn bàn trống.",
  },
  {
    icon: Clock,
    title: "Bộ Đếm Giờ 90 Phút",
    desc: "Theo dõi thời gian dùng bữa của từng bàn. Cảnh báo màu khi gần hết giờ.",
  },
  {
    icon: BarChart3,
    title: "Phân Tích Dữ Liệu",
    desc: "Dashboard thống kê doanh thu, tỷ lệ lấp đầy, hiệu suất chi nhánh theo thời gian thực.",
  },
  {
    icon: Users,
    title: "Quản Lý Hàng Đợi",
    desc: "Theo dõi số khách chờ, ước tính thời gian chờ và thông báo khi có bàn trống.",
  },
  {
    icon: Star,
    title: "Đánh Giá Nhân Viên",
    desc: "Khách hàng đánh giá nhân viên ngay tại bàn. Quản lý xem báo cáo theo chi nhánh.",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);

  useEffect(() => {
    if (typeof window === "undefined" || !ytRef.current) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    (window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady = () => {
      const YT = (window as unknown as Record<string, unknown>).YT as {
        Player: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
      };
      new YT.Player(ytRef.current!, {
        videoId: "c4tW2VKeBys",
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: "c4tW2VKeBys",
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: { target: { mute: () => void; playVideo: () => void } }) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e: { data: number; target: { playVideo: () => void } }) => {
            if (e.data === 0) e.target.playVideo();
          },
        },
      });
    };

    return () => {
      delete (window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <span className="text-2xl font-black text-dookki-red tracking-tight">DOOKKI</span>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
          <a href="#branches" className="hover:text-white transition-colors">Chi nhánh</a>
          <a href="#about" className="hover:text-white transition-colors">Giới thiệu</a>
        </div>
        <Link
          href="/select"
          className="flex items-center gap-2 bg-dookki-red hover:bg-dookki-red-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-red-500/20"
        >
          Vào ứng dụng <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* HERO VIDEO */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="absolute inset-0">
          <div
            ref={ytRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: "scale(1.25)" }}
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black pointer-events-none" />
          <div className="absolute inset-0 bg-dookki-red/5 pointer-events-none" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-dookki-red uppercase mb-6 border border-dookki-red/30 bg-dookki-red/10 px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-dookki-red animate-pulse" />
              Hệ Thống Quản Lý Thời Gian Thực
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6"
          >
            <span className="text-white">DOOKKI</span>
            <br />
            <span className="text-dookki-red">LIVE BOARD</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Hệ thống quản lý bàn thông minh cho Dookki Korean Buffet.
            Giảm thời gian chờ từ 40 phút xuống còn 15 phút.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/customer"
              className="flex items-center gap-2 bg-dookki-red hover:bg-dookki-red-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-2xl shadow-red-500/30 hover:scale-105"
            >
              Xem Bàn Trống Ngay <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/select"
              className="flex items-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all backdrop-blur-sm"
            >
              Nhân Viên Đăng Nhập
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 flex items-center justify-center gap-8 flex-wrap"
          >
            {[
              { value: "8", label: "Chi Nhánh HN" },
              { value: "116", label: "Tổng Số Bàn" },
              { value: "< 15 phút", label: "Thời Gian Chờ" },
              { value: "100%", label: "Thời Gian Thực" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-dookki-red">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* TICKER */}
      <div className="bg-dookki-red py-3 overflow-hidden">
        <div className="ticker-text text-white font-semibold text-sm tracking-wide">
          {Array(4).fill(
            "🍖 Dookki Korean Buffet Hà Nội &nbsp;•&nbsp; Cập nhật bàn theo thời gian thực &nbsp;•&nbsp; 8 chi nhánh tại Hà Nội &nbsp;•&nbsp; Giảm thời gian chờ đến 60% &nbsp;•&nbsp;"
          ).join("")}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-dookki-red text-sm font-bold tracking-widest uppercase">Tính Năng</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4">
              Mọi thứ bạn cần<br />
              <span className="text-dookki-red">trong một hệ thống</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Từ quản lý bàn đến phân tích dữ liệu — tất cả đồng bộ thời gian thực
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-dookki-red/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-dookki-red/20 border border-dookki-red/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-dookki-red" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROMOTIONAL VIDEO */}
      <section id="about" className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-dookki-red text-sm font-bold tracking-widest uppercase">Về Dookki</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 mb-6">
                Trải nghiệm buffet<br />
                <span className="text-dookki-red">Hàn Quốc đỉnh cao</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Dookki mang đến trải nghiệm nướng và lẩu Hàn Quốc theo phong cách buffet hiện đại.
                Với hệ thống quản lý bàn thông minh, chúng tôi đảm bảo khách hàng được phục vụ
                nhanh chóng và chuyên nghiệp nhất.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-center">
                  <div className="text-2xl font-black text-dookki-red">8</div>
                  <div className="text-xs text-white/50">Chi nhánh HN</div>
                </div>
                <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-center">
                  <div className="text-2xl font-black text-dookki-red">116</div>
                  <div className="text-xs text-white/50">Tổng số bàn</div>
                </div>
                <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-center">
                  <div className="text-2xl font-black text-dookki-red">90'</div>
                  <div className="text-xs text-white/50">Mỗi lượt phục vụ</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden aspect-video border border-white/10"
            >
              <iframe
                src="https://www.youtube.com/embed/qZSG7XCiYqk?rel=0&modestbranding=1"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* IMAGE GALLERY */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">Không Gian Dookki</h2>
          <p className="text-white/50">Thiết kế hiện đại, không gian thoải mái</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl aspect-square border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt="Dookki Restaurant"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* BRANCHES */}
      <section id="branches" className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-dookki-red text-sm font-bold tracking-widest uppercase">Chi Nhánh</span>
            <h2 className="text-4xl font-black mt-3 mb-4">8 Chi Nhánh tại Hà Nội</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BRANCHES.map((branch, i) => (
              <motion.div
                key={branch.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-dookki-red/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <MapPin className="w-4 h-4 text-dookki-red mt-0.5 flex-shrink-0" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${branch.wait === "0 phút" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {branch.wait === "0 phút" ? "Còn bàn" : `Chờ ${branch.wait}`}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">{branch.name}</h3>
                <p className="text-xs text-white/40">{branch.district}</p>
                <p className="text-xs text-white/60 mt-2">{branch.tables} bàn</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/customer"
              className="inline-flex items-center gap-2 bg-dookki-red hover:bg-dookki-red-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-2xl shadow-red-500/30"
            >
              Xem Trạng Thái Bàn Theo Thời Gian Thực <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl border border-dookki-red/30 bg-gradient-to-br from-dookki-red/10 to-transparent"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Sẵn Sàng Trải Nghiệm?
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Xem bàn trống, chờ đợi thông minh, trải nghiệm dịch vụ đỉnh cao.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/customer"
                className="flex items-center justify-center gap-2 bg-dookki-red hover:bg-dookki-red-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-2xl shadow-red-500/30"
              >
                Tôi Là Khách Hàng <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/staff/login"
                className="flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all"
              >
                Tôi Là Nhân Viên
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-2xl font-black text-dookki-red">DOOKKI</span>
              <p className="text-white/40 text-sm mt-1">Korean Buffet • Hà Nội</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/40">
              <Link href="/customer" className="hover:text-white transition-colors">Khách Hàng</Link>
              <Link href="/staff/login" className="hover:text-white transition-colors">Nhân Viên</Link>
              <Link href="/live-board" className="hover:text-white transition-colors">Bảng Live</Link>
              <Link href="/analytics" className="hover:text-white transition-colors">Thống Kê</Link>
              <Link href="/map" className="hover:text-white transition-colors">Bản Đồ</Link>
            </div>
            <p className="text-white/20 text-xs">© 2024 Dookki Live Board. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
