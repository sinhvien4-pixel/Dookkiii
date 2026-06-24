"use client";

import { useEffect } from "react";
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";
import { Branch, Feedback } from "@/types";
import { generateDemoBranches, generateDemoFeedbacks } from "@/lib/demoData";

async function seedIfEmpty() {
  const db = getDb();
  const snap = await getDocs(collection(db, "branches"));
  if (snap.size > 0) return;

  const branches = generateDemoBranches();
  const feedbacks = generateDemoFeedbacks(branches);

  const batch = writeBatch(db);
  branches.forEach((b) => batch.set(doc(db, "branches", b.id), b));
  feedbacks.forEach((f) => batch.set(doc(db, "feedbacks", f.id), f));
  await batch.commit();
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const db = getDb();

    seedIfEmpty().then(() => useAppStore.getState().setConnected(true));

    const unsubBranches = onSnapshot(
      collection(db, "branches"),
      (snap) => {
        const branches: Branch[] = snap.docs.map((d) => d.data() as Branch);
        useAppStore.getState().setBranches(branches);
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

    return () => {
      unsubBranches();
      unsubFeedbacks();
    };
  }, []);

  return <>{children}</>;
}
