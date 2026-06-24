"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Branch, Feedback } from "@/types";
import { generateDemoBranches, generateDemoFeedbacks } from "@/lib/demoData";

const DATA_VERSION = 5;
const BATCH_LIMIT = 400;

function loadInstantData() {
  const store = useAppStore.getState();
  if (store.branches.length > 0) return;
  const branches = generateDemoBranches();
  const feedbacks = generateDemoFeedbacks(branches);
  store.setBranches(branches);
  store.setFeedbacks(feedbacks);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  loadInstantData();

  useEffect(() => {
    let unsubBranches: (() => void) | undefined;
    let unsubFeedbacks: (() => void) | undefined;

    (async () => {
      try {
        const { getDb } = await import("@/lib/firebase");
        const fs = await import("firebase/firestore");
        const db = getDb();

        // Set up listeners FIRST — they handle reconnection gracefully
        unsubBranches = fs.onSnapshot(
          fs.collection(db, "branches"),
          (snap) => {
            const branches: Branch[] = snap.docs.map((d) => d.data() as Branch);
            if (branches.length > 0) {
              useAppStore.getState().setBranches(branches);
            }
            useAppStore.getState().setConnected(true);
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

        // Seed check with timeout — don't block if Firestore is slow
        const metaRef = fs.doc(db, "_meta", "version");
        const metaSnap = await withTimeout(fs.getDoc(metaRef), 8000);
        const ver = metaSnap.exists() ? metaSnap.data().v : 0;

        if (ver < DATA_VERSION) {
          const oldBranches = await withTimeout(fs.getDocs(fs.collection(db, "branches")), 8000);
          const oldFeedbacks = await withTimeout(fs.getDocs(fs.collection(db, "feedbacks")), 8000);

          const toDelete = [
            ...oldBranches.docs.map((d) => d.ref),
            ...oldFeedbacks.docs.map((d) => d.ref),
          ];
          for (let i = 0; i < toDelete.length; i += BATCH_LIMIT) {
            const batch = fs.writeBatch(db);
            toDelete.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
            await batch.commit();
          }

          const store = useAppStore.getState();
          const toWrite: Array<{ ref: ReturnType<typeof fs.doc>; data: unknown }> = [];
          store.branches.forEach((b) =>
            toWrite.push({ ref: fs.doc(db, "branches", b.id), data: JSON.parse(JSON.stringify(b)) })
          );
          store.feedbacks.forEach((f) =>
            toWrite.push({ ref: fs.doc(db, "feedbacks", f.id), data: JSON.parse(JSON.stringify(f)) })
          );

          for (let i = 0; i < toWrite.length; i += BATCH_LIMIT) {
            const batch = fs.writeBatch(db);
            toWrite.slice(i, i + BATCH_LIMIT).forEach((op) => batch.set(op.ref, op.data));
            await batch.commit();
          }

          await fs.setDoc(metaRef, { v: DATA_VERSION });
        }

        useAppStore.getState().setConnected(true);
      } catch (err) {
        console.warn("[Dookki] Seed skipped (will retry on next visit):", (err as Error).message);
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
