"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { generateDemoBranches, generateDemoFeedbacks } from "@/lib/demoData";

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // zustand/persist with localStorage is synchronous — by the time useEffect
    // runs, the store has already been hydrated from localStorage.
    // If branches is still empty, this is a first-time visitor → seed demo data.
    const state = useAppStore.getState();
    if (state.branches.length === 0) {
      const branches = generateDemoBranches();
      const feedbacks = generateDemoFeedbacks(branches);
      state.setBranches(branches);
      state.setFeedbacks(feedbacks);
    }
  }, []);

  return <>{children}</>;
}
