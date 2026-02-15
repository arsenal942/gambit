"use client";

import { useEffect, useRef } from "react";
import type { Move } from "@gambit/engine";
import { soundManager, type SoundKey } from "@/lib/sound-manager";

function soundForMoveType(move: Move): SoundKey {
  switch (move.type) {
    case "move":
      return `${move.piece.type}-move` as SoundKey;
    case "capture":
      return move.piece.type === "archer"
        ? "longshot"
        : (`${move.piece.type}-capture` as SoundKey);
    case "longshot":
      return "longshot";
    case "pushback":
      return "pushback";
    case "promotion":
      return "promotion";
    case "ransom":
      return "ransom";
    default:
      return "footman-move";
  }
}

/**
 * Hook that plays sounds during replay playback.
 * Debounces rapid frame changes (scrubbing) to avoid sound spam.
 */
export function useReplaySounds(
  currentIndex: number,
  currentMove: Move | null,
  isPlaying: boolean,
) {
  const prevIndexRef = useRef(currentIndex);
  const lastSoundTimeRef = useRef(0);

  useEffect(() => {
    soundManager.init();
  }, []);

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = currentIndex;

    // No sound for initial frame or same frame
    if (currentIndex === prevIndex || currentIndex === 0) return;
    if (!currentMove) return;

    // Debounce: skip sounds if frames change faster than 200ms
    const now = Date.now();
    if (now - lastSoundTimeRef.current < 200) return;
    lastSoundTimeRef.current = now;

    // Going forward — play the move sound
    if (currentIndex > prevIndex) {
      soundManager.play(soundForMoveType(currentMove));
    }
  }, [currentIndex, currentMove, isPlaying]);
}
