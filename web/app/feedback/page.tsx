"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, CheckCircle, Send } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";

const PRESET_COMMENTS = [
  "Phục vụ rất tốt",
  "Nhiệt tình và thân thiện",
  "Hỗ trợ rất chu đáo",
  "Phục vụ chậm",
  "Không thân thiện",
  "Quên refill nước",
  "Nhầm món",
  "Cần cải thiện thêm",
];

export default function FeedbackPage() {
  const { branches, createFeedback } = useAppStore();

  const [step, setStep] = useState(1);
  const [branchId, setBranchId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedBranch = branches.find((b) => b.id === branchId);
  const selectedEmployee = selectedBranch?.employees.find((e) => e.id === employeeId);

  const handleSubmit = () => {
    if (!branchId || !employeeId || rating === 0) return;
    createFeedback({
      branchId,
      employeeId,
      rating,
      comment,
      customerName: customerName || "Khách ẩn danh",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Cảm Ơn Bạn!</h2>
          <p className="text-white/50 mb-2">Đánh giá của bạn đã được ghi nhận.</p>
          <p className="text-white/30 text-sm mb-8">Phản hồi của bạn giúp Dookki không ngừng cải thiện chất lượng phục vụ.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSubmitted(false); setStep(1); setBranchId(""); setEmployeeId(""); setRating(0); setComment(""); setCustomerName(""); }}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              Đánh Giá Thêm
            </button>
            <Link href="/customer" className="flex-1 py-3 rounded-xl bg-dookki-red text-white font-bold text-center text-sm hover:bg-dookki-red-dark transition-colors">
              Về Trang Chính
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customer" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black">Đánh Giá Nhân Viên</h1>
              <p className="text-xs text-white/40">Giúp chúng tôi cải thiện dịch vụ</p>
            </div>
          </div>
          <ConnectionStatus />
        </div>

        {/* Steps */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s < step ? "bg-green-500 text-white" :
                  s === step ? "bg-dookki-red text-white" :
                  "bg-white/10 text-white/30"
                }`}>
                  {s < step ? "✓" : s}
                </div>
                {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? "bg-green-500" : "bg-white/10"}`} style={{ width: 40 }} />}
              </div>
            ))}
            <div className="ml-3 text-xs text-white/40">
              {step === 1 ? "Chọn chi nhánh" : step === 2 ? "Chọn nhân viên" : step === 3 ? "Xếp hạng" : "Hoàn tất"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: BRANCH */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-2xl font-black mb-6">Bạn đang ở chi nhánh nào?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setBranchId(b.id); setStep(2); }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      branchId === b.id
                        ? "border-dookki-red bg-dookki-red/10"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-bold">{b.name}</div>
                    <div className="text-xs text-white/40 mt-1">{b.address}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: EMPLOYEE */}
          {step === 2 && selectedBranch && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
                ← {selectedBranch.name}
              </button>
              <h2 className="text-2xl font-black mb-6">Chọn nhân viên phục vụ bạn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedBranch.employees.map((emp) => {
                  const avg = emp.feedbackCount > 0 ? (emp.totalRating / emp.feedbackCount).toFixed(1) : null;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => { setEmployeeId(emp.id); setStep(3); }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        employeeId === emp.id
                          ? "border-dookki-red bg-dookki-red/10"
                          : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-dookki-red/20 border border-dookki-red/30 flex items-center justify-center font-bold text-dookki-red flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{emp.name}</div>
                        <div className="text-xs text-white/40">{emp.position}</div>
                        {avg && <div className="text-xs text-yellow-400 mt-0.5">⭐ {avg}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: RATING */}
          {step === 3 && selectedEmployee && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
                ← {selectedEmployee.name}
              </button>
              <h2 className="text-2xl font-black mb-2">Đánh giá nhân viên</h2>
              <p className="text-white/40 mb-8">{selectedEmployee.name} — {selectedEmployee.position}</p>

              {/* Stars */}
              <div className="flex items-center justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-all"
                  >
                    <Star
                      className={`w-12 h-12 transition-all ${
                        s <= (hoveredStar || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/20"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              {rating > 0 && (
                <div className="text-center text-lg font-bold mb-8 text-yellow-400">
                  {["", "Rất Tệ", "Tệ", "Bình Thường", "Tốt", "Xuất Sắc"][rating]}
                </div>
              )}

              {/* Comment presets */}
              <div className="mb-4">
                <p className="text-sm text-white/50 mb-3">Chọn nhận xét nhanh:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COMMENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setComment(c)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        comment === c
                          ? "bg-dookki-red text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hoặc viết nhận xét của bạn..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-dookki-red resize-none text-sm mb-4"
              />

              {/* Name */}
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tên của bạn (tùy chọn)"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-dookki-red text-sm mb-6"
              />

              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full py-4 rounded-xl bg-dookki-red hover:bg-dookki-red-dark text-white font-black text-lg transition-all shadow-xl shadow-red-500/20 disabled:opacity-40 flex items-center justify-center gap-3"
              >
                <Send className="w-5 h-5" />
                Gửi Đánh Giá
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
