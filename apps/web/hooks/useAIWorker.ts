"use client";

import { useRef, useCallback, useEffect } from "react";
import type { GameState } from "@gambit/engine";
import type { BotProfile, SearchResult } from "@gambit/engine";
import type { AIWorkerResponse, AIWorkerError } from "@/workers/ai-worker";

export function useAIWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<{
    resolve: (result: SearchResult) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/ai-worker.ts", import.meta.url),
    );

    workerRef.current.onmessage = (
      event: MessageEvent<AIWorkerResponse | AIWorkerError>,
    ) => {
      const pending = pendingRef.current;
      if (!pending) return;

      clearTimeout(pending.timeout);
      pendingRef.current = null;

      if (event.data.type === "result") {
        pending.resolve(event.data.result);
      } else if (event.data.type === "error") {
        pending.reject(new Error(event.data.error));
      }
    };

    workerRef.current.onerror = (event) => {
      const pending = pendingRef.current;
      if (pending) {
        clearTimeout(pending.timeout);
        pendingRef.current = null;
        pending.reject(new Error("AI worker error"));
      }
    };

    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timeout);
        pendingRef.current = null;
      }
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const compute = useCallback(
    (gameState: GameState, profile: BotProfile): Promise<SearchResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Worker not initialized"));
          return;
        }

        // Cancel any pending computation
        if (pendingRef.current) {
          clearTimeout(pendingRef.current.timeout);
          pendingRef.current.reject(new Error("Cancelled"));
        }

        const requestId = Math.random().toString(36).slice(2);

        const timeout = setTimeout(() => {
          pendingRef.current = null;
          reject(new Error("AI computation timed out"));
        }, profile.timeLimitMs + 3000);

        pendingRef.current = { resolve, reject, timeout };

        workerRef.current.postMessage({
          type: "compute",
          gameState,
          botProfile: profile,
          requestId,
        });
      });
    },
    [],
  );

  return { compute };
}
