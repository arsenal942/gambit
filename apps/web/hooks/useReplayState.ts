"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { Move } from "@gambit/engine";
import { computeReplayFrames, type ReplayFrame } from "@/lib/replay-helpers";

export interface ReplayState {
  frames: ReplayFrame[];
  currentIndex: number;
  currentFrame: ReplayFrame;
  totalFrames: number;
  isPlaying: boolean;
  canGoForward: boolean;
  canGoBack: boolean;
  stepForward: () => void;
  stepBackward: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  goToFrame: (index: number) => void;
  toggleAutoPlay: () => void;
}

export function useReplayState(moves: Move[]): ReplayState {
  const frames = useMemo(() => computeReplayFrames(moves), [moves]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalFrames = frames.length;
  const canGoForward = currentIndex < totalFrames - 1;
  const canGoBack = currentIndex > 0;
  const currentFrame = frames[currentIndex];

  const stepForward = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, totalFrames - 1));
  }, [totalFrames]);

  const stepBackward = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToStart = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentIndex(totalFrames - 1);
    setIsPlaying(false);
  }, [totalFrames]);

  const goToFrame = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, totalFrames - 1)));
    },
    [totalFrames],
  );

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((i) => {
          if (i >= totalFrames - 1) {
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, totalFrames]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture events from input elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          stepBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case "Home":
          e.preventDefault();
          goToStart();
          break;
        case "End":
          e.preventDefault();
          goToEnd();
          break;
        case " ":
          e.preventDefault();
          toggleAutoPlay();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stepForward, stepBackward, goToStart, goToEnd, toggleAutoPlay]);

  return {
    frames,
    currentIndex,
    currentFrame,
    totalFrames,
    isPlaying,
    canGoForward,
    canGoBack,
    stepForward,
    stepBackward,
    goToStart,
    goToEnd,
    goToFrame,
    toggleAutoPlay,
  };
}
