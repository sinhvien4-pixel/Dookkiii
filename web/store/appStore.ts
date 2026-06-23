import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Branch, Feedback } from "@/types";

interface AppState {
  branches: Branch[];
  feedbacks: Feedback[];
  isConnected: boolean;
  selectedBranchId: string | null;
  staffBranchId: string | null;
  staffName: string | null;

  // ── Setters ──────────────────────────────────────────────────────────
  // Data mutations are handled exclusively by the service layer (services/).
  // When migrating to Firebase: services write to Firestore, and
  // Firestore onSnapshot listeners call these setters to sync the store.
  setBranches: (branches: Branch[]) => void;
  updateBranch: (branchId: string, branch: Branch) => void;
  setFeedbacks: (feedbacks: Feedback[]) => void;
  setConnected: (connected: boolean) => void;
  setSelectedBranch: (id: string | null) => void;
  setStaffBranch: (id: string | null) => void;
  setStaffName: (name: string | null) => void;

  // ── Derived reads ─────────────────────────────────────────────────────
  getSelectedBranch: () => Branch | null;
  getStaffBranch: () => Branch | null;
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
