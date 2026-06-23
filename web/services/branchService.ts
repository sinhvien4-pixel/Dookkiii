import { useAppStore } from "@/store/appStore";
import { generateDemoBranches, generateDemoFeedbacks } from "@/lib/demoData";
import { Branch } from "@/types";

export const branchService = {
  getAll(): Branch[] {
    return useAppStore.getState().branches;
  },

  getById(id: string): Branch | null {
    return useAppStore.getState().branches.find((b) => b.id === id) ?? null;
  },

  initialize() {
    const store = useAppStore.getState();
    if (store.branches.length === 0) {
      const branches = generateDemoBranches();
      const feedbacks = generateDemoFeedbacks(branches);
      store.setBranches(branches);
      store.setFeedbacks(feedbacks);
    }
  },
};
