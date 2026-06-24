import { doc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";
import { v4 as uuidv4 } from "uuid";

export const queueService = {
  add(branchId: string, name: string, partySize: number, phone: string) {
    const store = useAppStore.getState();
    const branch = store.branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      waitingQueue: [
        ...branch.waitingQueue,
        {
          id: uuidv4(),
          branchId,
          name,
          partySize,
          joinedAt: new Date().toISOString(),
          phone,
        },
      ],
    };

    store.updateBranch(branchId, updated);

    setDoc(doc(getDb(), "branches", branchId), updated).catch((err) =>
      console.error("Failed to save queue change:", err)
    );
  },

  remove(branchId: string, customerId: string) {
    const store = useAppStore.getState();
    const branch = store.branches.find((b) => b.id === branchId);
    if (!branch) return;

    const updated = {
      ...branch,
      waitingQueue: branch.waitingQueue.filter((c) => c.id !== customerId),
    };

    store.updateBranch(branchId, updated);

    setDoc(doc(getDb(), "branches", branchId), updated).catch((err) =>
      console.error("Failed to save queue change:", err)
    );
  },
};
