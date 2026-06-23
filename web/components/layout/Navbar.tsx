"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/customer", label: "Khách Hàng" },
  { href: "/map", label: "Bản Đồ" },
  { href: "/live-board", label: "Bảng Live" },
  { href: "/analytics", label: "Thống Kê" },
  { href: "/feedback", label: "Đánh Giá" },
  { href: "/staff/login", label: "Nhân Viên" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10"
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-black text-dookki-red tracking-tight">DOOKKI</span>
        <span className="text-xs text-white/50 font-medium hidden sm:block">LIVE BOARD</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              pathname?.startsWith(link.href)
                ? "bg-dookki-red text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <ConnectionStatus />
    </motion.nav>
  );
}
