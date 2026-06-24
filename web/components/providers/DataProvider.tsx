"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Branch, Feedback } from "@/types";
import { generateDemoBranches, generateDemoFeedbacks } from "@/lib/demoData";

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const store = useAppStore.getState();
    if (store.branches.length === 0) {
      const branches = generateDemoBranches();
      const feedbacks = generateDemoFeedbacks(branches);
      store.setBranches(branches);
      store.setFeedbacks(feedbacks);
    }

    (async () => {
      try {
        const { getDb } = await import("@/lib/firebase");
        const {
          collection, onSnapshot, getDocs, doc, writeBatch,
        } = await import("firebase/firestore");

        const db = getDb();

        const snap = await getDocs(collection(db, "branches"));
        if (snap.size < 8) {
          if (snap.size > 0) {
            const { deleteDoc } = await import("firebase/firestore");
            const fbSnap = await getDocs(collection(db, "feedbacks"));
            const delBatch = writeBatch(db);
            snap.docs.forEach((d) => delBatch.delete(d.ref));
            fbSnap.docs.forEach((d) => delBatch.delete(d.ref));
            await delBatch.commit();
          }

          const curBranches = useAppStore.getState().branches;
          const curFeedbacks = useAppStore.getState().feedbacks;

          const BATCH_LIMIT = 450;
          const allOps: Array<{ ref: ReturnType<typeof doc>; data: Branch | Feedback }> = [];
          curBranches.forEach((b) => allOps.push({ ref: doc(db, "branches", b.id), data: b }));
          curFeedbacks.forEach((f) => allOps.push({ ref: doc(db, "feedbacks", f.id), data: f }));

          for (let i = 0; i < allOps.length; i += BATCH_LIMIT) {
            const batch = writeBatch(db);
            allOps.slice(i, i + BATCH_LIMIT).forEach((op) => batch.set(op.ref, op.data));
            await batch.commit();
          }
        }

        const unsubBranches = onSnapshot(
          collection(db, "branches"),
          (snap) => {
            const branches: Branch[] = snap.docs.map((d) => d.data() as Branch);
            if (branches.length > 0) {
              useAppStore.getState().setBranches(branches);
            }
            useAppStore.getState().setConnected(true);
          },
          () => useAppStore.getState().setConnected(false)
        );

        const unsubFeedbacks = onSnapshot(
          collection(db, "feedbacks"),
          (snap) => {
            const feedbacks: Feedback[] = snap.docs.map((d) => d.data() as Feedback);
            useAppStore.getState().setFeedbacks(feedbacks);
          }
        );

        useAppStore.getState().setConnected(true);
        cleanup = () => { unsubBranches(); unsubFeedbacks(); };
      } catch (err) {
        console.warn("Firebase unavailable, using local data:", err);
        useAppStore.getState().setConnected(false);
      }
    })();

    return () => cleanup?.();
  }, []);

  return <>{children}</>;
}
