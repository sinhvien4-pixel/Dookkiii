"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChefHat, Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";

export default function StaffLoginPage() {
  const router = useRouter();
  const { setStaffName } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
      const { getApps, initializeApp } = await import("firebase/app");
      if (getApps().length === 0) {
        initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      }
      const auth = getAuth();
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const displayName = cred.user.displayName || cred.user.email?.split("@")[0] || "Nhân viên";
      setStaffName(displayName);
      router.push("/staff/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("Email hoặc mật khẩu không đúng.");
      } else if (code === "auth/wrong-password") {
        setError("Mật khẩu không đúng.");
      } else if (code === "auth/invalid-email") {
        setError("Email không hợp lệ.");
      } else if (code === "auth/too-many-requests") {
        setError("Quá nhiều lần thử. Vui lòng đợi một lát.");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dookki-red/5 via-black to-black" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Link
          href="/select"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-dookki-red/20 border border-dookki-red/30 flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-dookki-red" />
            </div>
            <h1 className="text-2xl font-black text-white">Đăng Nhập Nhân Viên</h1>
            <p className="text-white/40 text-sm mt-1">Hệ thống quản lý Dookki</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-white/60 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@dookki.vn"
                  className="staff-input w-full h-11 pl-10 pr-4 rounded-xl border border-white/15 text-sm"
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-white/60 font-medium">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="staff-input w-full h-11 pl-10 pr-12 rounded-xl border border-white/15 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-10"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-dookki-red hover:bg-dookki-red-dark text-white font-bold text-base transition-all shadow-lg shadow-red-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
