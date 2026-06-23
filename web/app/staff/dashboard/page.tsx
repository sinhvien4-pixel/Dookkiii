"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Plus, Minus, Users,
  UserPlus, Trash2, Settings, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { tableService } from "@/services/tableService";
import { queueService } from "@/services/queueService";
import {
  getBranchStats, getTimerColor,
  getTableRemainingMinutes, getTableElapsedMinutes, formatTimeAgo
} from "@/lib/utils";
import { TableStatusBadge } from "@/components/shared/TableStatusBadge";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { Branch, Table, WaitingCustomer } from "@/types";

export default function StaffDashboard() {
  const router = useRouter();
  const { branches, staffBranchId, staffName, setStaffBranch } = useAppStore();

  const [customTimeDialog, setCustomTimeDialog] = useState<{ tableId: string; open: boolean } | null>(null);
  const [customMins, setCustomMins] = useState("90");
  const [startGuestsDialog, setStartGuestsDialog] = useState<{ tableId: string; open: boolean } | null>(null);
  const [guestCount, setGuestCount] = useState("2");
  const [queueDialog, setQueueDialog] = useState(false);
  const [queueName, setQueueName] = useState("");
  const [queueParty, setQueueParty] = useState("2");
  const [queuePhone, setQueuePhone] = useState("");

  const currentBranch = branches.find((b) => b.id === staffBranchId);

  if (!staffBranchId || !currentBranch) {
    return (
      <BranchSelector
        branches={branches}
        onSelect={(id) => setStaffBranch(id)}
        staffName={staffName}
      />
    );
  }

  const stats = getBranchStats(currentBranch);

  const confirmStartServing = () => {
    if (!startGuestsDialog) return;
    tableService.startTable(staffBranchId, startGuestsDialog.tableId, parseInt(guestCount) || 2);
    setStartGuestsDialog(null);
    setGuestCount("2");
  };

  const handleAddQueue = () => {
    if (!queueName.trim()) return;
    queueService.add(staffBranchId, queueName, parseInt(queueParty) || 2, queuePhone);
    setQueueName("");
    setQueueParty("2");
    setQueuePhone("");
    setQueueDialog(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStaffBranch(null)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-white">{currentBranch.name}</h1>
              <p className="text-xs text-white/40">Xin chào, {staffName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <Link
              href="/live-board"
              className="hidden sm:flex items-center gap-1.5 text-xs border border-white/10 rounded-lg px-3 py-1.5 text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              📺 Bảng Live
            </Link>
            <button
              onClick={() => {
                setStaffBranch(null);
                router.push("/staff/login");
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-7xl mx-auto px-4 pb-3 grid grid-cols-5 gap-2">
          {[
            { label: "Tổng", value: stats.totalTables, color: "text-white" },
            { label: "Trống", value: stats.availableTables, color: "text-green-400" },
            { label: "Sử dụng", value: stats.occupiedTables, color: "text-red-400" },
            { label: "Dọn dẹp", value: stats.cleaningTables, color: "text-yellow-400" },
            { label: "Chờ", value: stats.waitingCount, color: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-xl bg-white/5 border border-white/10">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TABLE GRID */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black">Quản Lý Bàn</h2>
            <span className="text-xs text-white/40">{currentBranch.totalTables} bàn</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentBranch.tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onStart={() => setStartGuestsDialog({ tableId: table.id, open: true })}
                onEnd={() => tableService.endTable(staffBranchId, table.id)}
                onCleaning={() => tableService.setCleaning(staffBranchId, table.id)}
                onAvailable={() => tableService.setAvailable(staffBranchId, table.id)}
                onAddTime={() => tableService.adjustTime(staffBranchId, table.id, 5)}
                onSubTime={() => tableService.adjustTime(staffBranchId, table.id, -5)}
                onCustomTime={() => setCustomTimeDialog({ tableId: table.id, open: true })}
              />
            ))}
          </div>
        </div>

        {/* QUEUE + EMPLOYEES */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black">Hàng Đợi</h2>
            <button
              onClick={() => setQueueDialog(true)}
              className="flex items-center gap-1.5 text-sm bg-dookki-red hover:bg-dookki-red-dark text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Thêm
            </button>
          </div>

          {currentBranch.waitingQueue.length === 0 ? (
            <div className="text-center py-12 text-white/30 border border-white/10 rounded-2xl bg-white/5">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Không có khách đang chờ</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentBranch.waitingQueue.map((customer, i) => (
                <QueueItem
                  key={customer.id}
                  customer={customer}
                  index={i}
                  onRemove={() => queueService.remove(staffBranchId, customer.id)}
                />
              ))}
            </div>
          )}

          {/* Employees */}
          <div className="mt-6">
            <h2 className="text-lg font-black mb-4">Nhân Viên Ca Này</h2>
            <div className="space-y-2">
              {currentBranch.employees.map((emp) => {
                const avg =
                  emp.feedbackCount > 0
                    ? (emp.totalRating / emp.feedbackCount).toFixed(1)
                    : "–";
                return (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-9 h-9 rounded-full bg-dookki-red/20 border border-dookki-red/30 flex items-center justify-center text-sm font-bold text-dookki-red flex-shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{emp.name}</div>
                      <div className="text-xs text-white/40">{emp.position}</div>
                    </div>
                    <div className="text-xs text-yellow-400 font-bold">⭐ {avg}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* START SERVING DIALOG */}
      <AnimatePresence>
        {startGuestsDialog?.open && (
          <ModalOverlay onClose={() => setStartGuestsDialog(null)}>
            <h2 className="text-xl font-black mb-4">Bắt Đầu Phục Vụ</h2>
            <p className="text-white/60 text-sm mb-4">Nhập số khách tại bàn</p>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setGuestCount(String(Math.max(1, parseInt(guestCount) - 1)))}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-colors"
              >
                –
              </button>
              <input
                type="number"
                min="1"
                max="20"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="flex-1 h-12 text-center text-2xl font-black rounded-xl border border-white/20 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-dookki-red"
                style={{ colorScheme: "dark" }}
              />
              <button
                onClick={() => setGuestCount(String(parseInt(guestCount) + 1))}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmStartServing}
                className="flex-1 py-3 rounded-xl bg-dookki-red hover:bg-dookki-red-dark text-white font-bold transition-colors"
              >
                Bắt Đầu
              </button>
              <button
                onClick={() => setStartGuestsDialog(null)}
                className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* CUSTOM TIME DIALOG */}
      <AnimatePresence>
        {customTimeDialog?.open && (
          <ModalOverlay onClose={() => setCustomTimeDialog(null)}>
            <h2 className="text-xl font-black mb-4">Tùy Chỉnh Thời Gian</h2>
            <p className="text-white/60 text-sm mb-4">Đặt tổng thời gian phục vụ (phút)</p>
            <input
              type="number"
              min="10"
              max="180"
              value={customMins}
              onChange={(e) => setCustomMins(e.target.value)}
              className="w-full h-12 text-center text-2xl font-black rounded-xl border border-white/20 bg-zinc-800 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-dookki-red"
              style={{ colorScheme: "dark" }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  tableService.setCustomTime(staffBranchId, customTimeDialog.tableId, parseInt(customMins) || 90);
                  setCustomTimeDialog(null);
                }}
                className="flex-1 py-3 rounded-xl bg-dookki-red hover:bg-dookki-red-dark text-white font-bold transition-colors"
              >
                Lưu
              </button>
              <button
                onClick={() => setCustomTimeDialog(null)}
                className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* ADD QUEUE DIALOG */}
      <AnimatePresence>
        {queueDialog && (
          <ModalOverlay onClose={() => setQueueDialog(false)}>
            <h2 className="text-xl font-black mb-6">Thêm Khách Chờ</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Tên khách</label>
                <input
                  type="text"
                  value={queueName}
                  onChange={(e) => setQueueName(e.target.value)}
                  placeholder="Nhập tên khách..."
                  className="staff-input w-full h-10 px-3 rounded-xl border border-white/20 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Số người</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQueueParty(String(Math.max(1, parseInt(queueParty) - 1)))}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center"
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={queueParty}
                    onChange={(e) => setQueueParty(e.target.value)}
                    className="flex-1 h-10 text-center rounded-xl border border-white/20 bg-zinc-800 text-white font-bold focus:outline-none focus:ring-2 focus:ring-dookki-red"
                    style={{ colorScheme: "dark" }}
                  />
                  <button
                    onClick={() => setQueueParty(String(parseInt(queueParty) + 1))}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Số điện thoại (tùy chọn)</label>
                <input
                  type="tel"
                  value={queuePhone}
                  onChange={(e) => setQueuePhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="staff-input w-full h-10 px-3 rounded-xl border border-white/20 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddQueue}
                disabled={!queueName.trim()}
                className="flex-1 py-3 rounded-xl bg-dookki-red hover:bg-dookki-red-dark text-white font-bold transition-colors disabled:opacity-50"
              >
                Thêm Vào Hàng
              </button>
              <button
                onClick={() => setQueueDialog(false)}
                className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BranchSelector({
  branches,
  onSelect,
  staffName,
}: {
  branches: Branch[];
  onSelect: (id: string) => void;
  staffName: string | null;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <Link
        href="/staff/login"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Đăng xuất
      </Link>
      <div className="text-center mb-8">
        <div className="text-3xl font-black text-dookki-red mb-2">DOOKKI</div>
        <h2 className="text-2xl font-black">Chọn Chi Nhánh</h2>
        {staffName && <p className="text-white/50 mt-2">Xin chào, {staffName}</p>}
      </div>
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        {branches.map((branch) => {
          const stats = getBranchStats(branch);
          return (
            <button
              key={branch.id}
              onClick={() => onSelect(branch.id)}
              className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-dookki-red/40 hover:bg-dookki-red/10 text-left transition-all group"
            >
              <div className="font-bold text-white mb-1 group-hover:text-dookki-red transition-colors">
                {branch.name}
              </div>
              <div className="text-xs text-white/40 mb-3">{branch.address}</div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-400">{stats.availableTables} trống</span>
                <span className="text-red-400">{stats.occupiedTables} đang dùng</span>
                <span className="text-blue-400">{stats.waitingCount} chờ</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TableCard({
  table,
  onStart,
  onEnd,
  onCleaning,
  onAvailable,
  onAddTime,
  onSubTime,
  onCustomTime,
}: {
  table: Table;
  onStart: () => void;
  onEnd: () => void;
  onCleaning: () => void;
  onAvailable: () => void;
  onAddTime: () => void;
  onSubTime: () => void;
  onCustomTime: () => void;
}) {
  const remaining = getTableRemainingMinutes(table);
  const elapsed = getTableElapsedMinutes(table);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        table.status === "available"
          ? "border-green-500/30 bg-green-500/5"
          : table.status === "occupied"
          ? "border-red-500/30 bg-red-500/5"
          : table.status === "cleaning"
          ? "border-yellow-500/30 bg-yellow-500/5"
          : "border-blue-500/30 bg-blue-500/5"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-2xl font-black">Bàn {String(table.number).padStart(2, "0")}</div>
          {table.guests > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/50 mt-0.5">
              <Users className="w-3 h-3" />
              {table.guests} khách
            </div>
          )}
        </div>
        <TableStatusBadge status={table.status} size="sm" />
      </div>

      {table.status === "occupied" && table.startTime && (
        <div className="mb-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Đã dùng: {elapsed} phút</span>
            <span className={`font-bold ${getTimerColor(remaining)}`}>Còn {remaining} phút</span>
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
      )}

      <div className="space-y-2">
        {table.status === "available" && (
          <button
            onClick={onStart}
            className="w-full py-2 rounded-lg bg-dookki-red hover:bg-dookki-red-dark text-white text-sm font-bold transition-colors"
          >
            ▶ Bắt Đầu Phục Vụ
          </button>
        )}
        {table.status === "occupied" && (
          <>
            <button
              onClick={onEnd}
              className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition-colors"
            >
              ■ Kết Thúc Phục Vụ
            </button>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={onSubTime}
                className="py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Minus className="w-3 h-3" /> 5 phút
              </button>
              <button
                onClick={onAddTime}
                className="py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> 5 phút
              </button>
              <button
                onClick={onCustomTime}
                className="py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Settings className="w-3 h-3" /> Sửa
              </button>
            </div>
          </>
        )}
        {table.status === "cleaning" && (
          <button
            onClick={onAvailable}
            className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors"
          >
            ✓ Sẵn Sàng Phục Vụ
          </button>
        )}
        {table.status === "reserved" && (
          <div className="flex gap-1.5">
            <button
              onClick={onStart}
              className="flex-1 py-2 rounded-lg bg-dookki-red hover:bg-dookki-red-dark text-white text-xs font-bold transition-colors"
            >
              Bắt Đầu
            </button>
            <button
              onClick={onAvailable}
              className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              Hủy Đặt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QueueItem({
  customer,
  index,
  onRemove,
}: {
  customer: WaitingCustomer;
  index: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
      <span className="w-7 h-7 rounded-full bg-dookki-red/20 text-dookki-red text-xs font-black flex items-center justify-center flex-shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{customer.name}</div>
        <div className="text-xs text-white/40">
          {customer.partySize} người • {formatTimeAgo(customer.joinedAt)}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
