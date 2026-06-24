"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Branch, Feedback } from "@/types";
import { generateDemoBranches, generateDemoFeedbacks } from "@/lib/demoData";

function loadInstantData() {
  const store = useAppStore.getState();
  if (store.branches.length > 0) return;
  const branches = generateDemoBranches();
  const feedbacks = generateDemoFeedbacks(branches);
  store.setBranches(branches);
  store.setFeedbacks(feedbacks);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  loadInstantData();

  useEffect(() => {
    let unsubBranches: (() => void) | undefined;
    let unsubFeedbacks: (() => void) | undefined;
    let seeding = false;

    (async () => {
      try {
        const { getDb } = await import("@/lib/firebase");
        const fs = await import("firebase/firestore");
        const db = getDb();

        unsubBranches = fs.onSnapshot(
          fs.collection(db, "branches"),
          async (snap) => {
            const branches: Branch[] = snap.docs.map((d) => d.data() as Branch);

            if (branches.length >= 8) {
              useAppStore.getState().setBranches(branches);
              useAppStore.getState().setConnected(true);
              return;
            }

            if (branches.length > 0 && branches.length < 8) {
              useAppStore.getState().setConnected(true);
              return;
            }

            if (seeding) return;
            seeding = true;

            try {
              const store = useAppStore.getState();
              for (const b of store.branches) {
                await fs.setDoc(
                  fs.doc(db, "branches", b.id),
                  JSON.parse(JSON.stringify(b))
                );
              }
              for (const f of store.feedbacks) {
                await fs.setDoc(
                  fs.doc(db, "feedbacks", f.id),
                  JSON.parse(JSON.stringify(f))
                );
              }
            } catch (e) {
              console.warn("[Dookki] Seed write failed:", e);
              seeding = false;
            }
          },
          () => useAppStore.getState().setConnected(false)
        );

        unsubFeedbacks = fs.onSnapshot(
          fs.collection(db, "feedbacks"),
          (snap) => {
            const feedbacks: Feedback[] = snap.docs.map((d) => d.data() as Feedback);
            if (feedbacks.length > 0) {
              useAppStore.getState().setFeedbacks(feedbacks);
            }
          }
        );
      } catch (err) {
        console.warn("[Dookki] Firebase init failed:", err);
        useAppStore.getState().setConnected(false);
      }
    })();

    return () => {
      unsubBranches?.();
      unsubFeedbacks?.();
    };
  }, []);

  return <>{children}</>;
}
