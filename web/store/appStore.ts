import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Branch, Feedback, Table } from "@/types";

// Helper: immutably update a single table inside a branch list
function patchTable(
  branches: Branch[],
  branchId: string,
  tableId: string,
  patch: Partial<Table>
): Branch[] {
  return branches.map((b) =>
    b.id !== branchId
      ? b
      : {
          ...b,
          tables: b.tables.map((t) =>
            t.id !== tableId ? t : { ...t, ...patch }
          ),
        }
  );
}

interface AppState {
  branches: Branch[];
  feedbacks: Feedback[];
  isConnected: boolean;
  selectedBranchId: string | null;
  staffBranchId: string | null;
  staffName: string | null;

  // ── Branch / bulk ───────────────────────────────────────────────────
  setBranches: (branches: Branch[]) => void;
  updateBranch: (branchId: string, branch: Branch) => void;
  setFeedbacks: (feedbacks: Feedback[]) => void;
  setConnected: (connected: boolean) => void;
  setSelectedBranch: (id: string | null) => void;
  setStaffBranch: (id: string | null) => void;
  setStaffName: (name: string | null) => void;
  getSelectedBranch: () => Branch | null;
  getStaffBranch: () => Branch | null;

  // ── Table actions (replaces Socket.IO emit) ─────────────────────────
  startTable: (branchId: string, tableId: string, guests: number) => void;
  endTable: (branchId: string, tableId: string) => void;
  setTableCleaning: (branchId: string, tableId: string) => void;
  setTableAvailable: (branchId: string, tableId: string) => void;
  adjustTableTime: (branchId: string, tableId: string, deltaMinutes: number) => void;
  setTableCustomTime: (branchId: string, tableId: string, totalMinutes: number) => void;

  // ── Queue actions ────────────────────────────────────────────────────
  addToQueue: (branchId: string, name: string, partySize: number, phone: string) => void;
  removeFromQueue: (branchId: string, customerId: string) => void;

  // ── Feedback actions ─────────────────────────────────────────────────
  createFeedback: (data: {
    branchId: string;
    employeeId: string;
    rating: number;
    comment: string;
    customerName: string;
  }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      branches: [],
      feedbacks: [],
      isConnected: true,
      selectedBranchId: null,
      staffBranchId: null,
      staffName: null,

      // ── Bulk setters ──────────────────────────────────────────────────
      setBranches: (branches) => set({ branches }),
      updateBranch: (branchId, branch) =>
        set((s) => ({ branches: s.branches.map((b) => (b.id === branchId ? branch : b)) })),
      setFeedbacks: (feedbacks) => set({ feedbacks }),
      setConnected: (connected) => set({ isConnected: connected }),
      setSelectedBranch: (id) => set({ selectedBranchId: id }),
      setStaffBranch: (id) => set({ staffBranchId: id }),
      setStaffName: (name) => set({ staffName: name }),

      getSelectedBranch: () => {
        const { branches, selectedBranchId } = get();
        return branches.find((b) => b.id === selectedBranchId) ?? null;
      },
      getStaffBranch: () => {
        const { branches, staffBranchId } = get();
        return branches.find((b) => b.id === staffBranchId) ?? null;
      },

      // ── Table actions ─────────────────────────────────────────────────
      startTable: (branchId, tableId, guests) =>
        set((s) => ({
          branches: patchTable(s.branches, branchId, tableId, {
            status: "occupied",
            guests,
            startTime: new Date().toISOString(),
          }),
        })),

      endTable: (branchId, tableId) =>
        set((s) => ({
          branches: patchTable(s.branches, branchId, tableId, {
            status: "cleaning",
            guests: 0,
            startTime: null,
          }),
        })),

      setTableCleaning: (branchId, tableId) =>
        set((s) => ({
          branches: patchTable(s.branches, branchId, tableId, {
            status: "cleaning",
            guests: 0,
            startTime: null,
          }),
        })),

      setTableAvailable: (branchId, tableId) =>
        set((s) => ({
          branches: patchTable(s.branches, branchId, tableId, {
            status: "available",
            guests: 0,
            startTime: null,
          }),
        })),

      adjustTableTime: (branchId, tableId, deltaMinutes) =>
        set((s) => ({
          branches: s.branches.map((b) =>
            b.id !== branchId
              ? b
              : {
                  ...b,
                  tables: b.tables.map((t) =>
                    t.id !== tableId
                      ? t
                      : {
                          ...t,
                          maxDiningMinutes: Math.max(
                            10,
                            t.maxDiningMinutes + deltaMinutes
                          ),
                        }
                  ),
                }
          ),
        })),

      setTableCustomTime: (branchId, tableId, totalMinutes) =>
        set((s) => ({
          branches: patchTable(s.branches, branchId, tableId, {
            maxDiningMinutes: Math.max(10, totalMinutes),
          }),
        })),

      // ── Queue actions ─────────────────────────────────────────────────
      addToQueue: (branchId, name, partySize, phone) =>
        set((s) => ({
          branches: s.branches.map((b) =>
            b.id !== branchId
              ? b
              : {
                  ...b,
                  waitingQueue: [
                    ...b.waitingQueue,
                    {
                      id: uuidv4(),
                      branchId,
                      name,
                      partySize,
                      joinedAt: new Date().toISOString(),
                      phone,
                    },
                  ],
                }
          ),
        })),

      removeFromQueue: (branchId, customerId) =>
        set((s) => ({
          branches: s.branches.map((b) =>
            b.id !== branchId
              ? b
              : {
                  ...b,
                  waitingQueue: b.waitingQueue.filter((c) => c.id !== customerId),
                }
          ),
        })),

      // ── Feedback ──────────────────────────────────────────────────────
      createFeedback: ({ branchId, employeeId, rating, comment, customerName }) => {
        const { branches } = get();
        const branch = branches.find((b) => b.id === branchId);
        const employee = branch?.employees.find((e) => e.id === employeeId);
        if (!branch || !employee) return;

        const newFeedback: Feedback = {
          id: uuidv4(),
          branchId,
          branchName: branch.name,
          employeeId,
          employeeName: employee.name,
          rating,
          comment,
          createdAt: new Date().toISOString(),
          customerName,
        };

        set((s) => ({
          feedbacks: [...s.feedbacks, newFeedback],
          branches: s.branches.map((b) =>
            b.id !== branchId
              ? b
              : {
                  ...b,
                  employees: b.employees.map((e) =>
                    e.id !== employeeId
                      ? e
                      : {
                          ...e,
                          totalRating: e.totalRating + rating,
                          feedbackCount: e.feedbackCount + 1,
                        }
                  ),
                }
          ),
        }));
      },
    }),
    {
      name: "dookki-live-board-v1",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return localStorage;
      }),
      partialize: (s) => ({
        branches: s.branches,
        feedbacks: s.feedbacks,
        staffBranchId: s.staffBranchId,
        staffName: s.staffName,
      }),
    }
  )
);
