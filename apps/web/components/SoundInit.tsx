"use client";

import { useEffect } from "react";
import { soundManager } from "@/lib/sound-manager";

/**
 * Invisible component that initializes the sound system on first client render.
 * Place in the root layout to ensure sounds are preloaded early.
 */
export function SoundInit() {
  useEffect(() => {
    soundManager.init();
  }, []);

  return null;
}
