"use client";

import { useSyncExternalStore, useCallback } from "react";
import { soundManager, type SoundPreferences } from "@/lib/sound-manager";

/**
 * React hook that subscribes to SoundManager preference changes.
 * Returns current preferences and setter functions.
 */
export function useSoundPreferences() {
  const preferences = useSyncExternalStore(
    (listener) => soundManager.subscribe(listener),
    () => soundManager.getPreferences(),
    // Server snapshot (SSR)
    () =>
      ({
        enabled: true,
        masterVolume: 0.8,
        sfxVolume: 0.7,
        musicVolume: 0.3,
      }) satisfies SoundPreferences,
  );

  const setMasterVolume = useCallback((vol: number) => {
    soundManager.setMasterVolume(vol);
  }, []);

  const setSfxVolume = useCallback((vol: number) => {
    soundManager.setSfxVolume(vol);
  }, []);

  const setMusicVolume = useCallback((vol: number) => {
    soundManager.setMusicVolume(vol);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    soundManager.setEnabled(enabled);
  }, []);

  const toggleEnabled = useCallback(() => {
    soundManager.toggleEnabled();
  }, []);

  const testSound = useCallback(() => {
    soundManager.play("select");
  }, []);

  return {
    preferences,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setEnabled,
    toggleEnabled,
    testSound,
  };
}
