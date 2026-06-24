"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Branch, Feedback } from "@/types";
import { generateDemoBranches, generateDemoFeedbacks } from "@/lib/demoData";

const DATA_VERSION = 4;

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
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { getDb } = await import("@/lib/firebase");
        const {
          collection, onSnapshot, getDocs, doc, writeBatch, getDoc, setDoc,
        } = await import("firebase/firestore");

        const db = getDb();

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
            if (feedbacks.length > 0) {
              useAppStore.getState().setFeedbacks(feedbacks);
            }
          }
        );

        cleanup = () => { unsubBranches(); unsubFeedbacks(); };

        const metaRef = doc(db, "_meta", "version");
        const metaSnap = await getDoc(metaRef);
        const currentVersion = metaSnap.exists() ? metaSnap.data().v : 0;

        if (currentVersion < DATA_VERSION) {
          const branchSnap = await getDocs(collection(db, "branches"));
          const fbSnap = await getDocs(collection(db, "feedbacks"));

          if (branchSnap.size > 0 || fbSnap.size > 0) {
            const delBatch = writeBatch(db);
            branchSnap.docs.forEach((d) => delBatch.delete(d.ref));
            fbSnap.docs.forEach((d) => delBatch.delete(d.ref));
            await delBatch.commit();
          }

          const store = useAppStore.getState();
          const BATCH_LIMIT = 450;
          const allOps: Array<{ ref: ReturnType<typeof doc>; data: Branch | Feedback }> = [];
          store.branches.forEach((b) => allOps.push({ ref: doc(db, "branches", b.id), data: b }));
          store.feedbacks.forEach((f) => allOps.push({ ref: doc(db, "feedbacks", f.id), data: f }));

          for (let i = 0; i < allOps.length; i += BATCH_LIMIT) {
            const batch = writeBatch(db);
            allOps.slice(i, i + BATCH_LIMIT).forEach((op) => batch.set(op.ref, op.data));
            await batch.commit();
          }

          await setDoc(metaRef, { v: DATA_VERSION });
        }
      } catch (err) {
        console.warn("Firebase unavailable, using local data:", err);
        useAppStore.getState().setConnected(false);
      }
    })();

    return () => cleanup?.();
  }, []);

  return <>{children}</>;
}
