"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAppStore } from "@/store/appStore";
import { Branch, Feedback } from "@/types";

export function useSocket() {
  const { setBranches, updateBranch, setFeedbacks, setConnected } = useAppStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("request:initial-data");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("initial:data", (data: { branches: Branch[]; feedbacks: Feedback[] }) => {
      setBranches(data.branches);
      setFeedbacks(data.feedbacks);
    });

    socket.on("branch:update", (data: { branchId: string; branch: Branch }) => {
      updateBranch(data.branchId, data.branch);
    });

    socket.on("feedback:update", (data: { feedbacks: Feedback[] }) => {
      setFeedbacks(data.feedbacks);
    });

    if (socket.connected) {
      setConnected(true);
      socket.emit("request:initial-data");
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("initial:data");
      socket.off("branch:update");
      socket.off("feedback:update");
    };
  }, [setBranches, updateBranch, setFeedbacks, setConnected]);

  return { socket: getSocket() };
}
