import { create } from "zustand";
import { Branch, Feedback } from "@/types";

interface AppState {
  branches: Branch[];
  feedbacks: Feedback[];
  isConnected: boolean;
  selectedBranchId: string | null;
  staffBranchId: string | null;
  staffName: string | null;

  setBranches: (branches: Branch[]) => void;
  updateBranch: (branchId: string, branch: Branch) => void;
  setFeedbacks: (feedbacks: Feedback[]) => void;
  addFeedback: (feedback: Feedback) => void;
  setConnected: (connected: boolean) => void;
  setSelectedBranch: (id: string | null) => void;
  setStaffBranch: (id: string | null) => void;
  setStaffName: (name: string | null) => void;
  getSelectedBranch: () => Branch | null;
  getStaffBranch: () => Branch | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  branches: [],
  feedbacks: [],
  isConnected: false,
  selectedBranchId: null,
  staffBranchId: null,
  staffName: null,

  setBranches: (branches) => set({ branches }),

  updateBranch: (branchId, branch) =>
    set((state) => ({
      branches: state.branches.map((b) => (b.id === branchId ? branch : b)),
    })),

  setFeedbacks: (feedbacks) => set({ feedbacks }),

  addFeedback: (feedback) =>
    set((state) => ({ feedbacks: [...state.feedbacks, feedback] })),

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
}));
