"use client";

import { Howl, Howler } from "howler";

// --- Types ---

export type SoundKey =
  // Movement
  | "footman-move"
  | "archer-move"
  | "knight-move"
  // Selection
  | "select"
  | "deselect"
  // Captures
  | "footman-capture"
  | "knight-capture"
  | "longshot"
  | "pushback"
  // Special abilities
  | "promotion"
  | "ransom"
  // Game state
  | "check"
  | "checkmate"
  | "annihilation"
  | "defeat"
  | "turn-change"
  | "game-start"
  | "draw-offer"
  // UI
  | "ui-click"
  | "error"
  | "match-found"
  | "copy";

export type MusicKey = "ambient-menu" | "ambient-game" | "victory-theme";

export interface SoundPreferences {
  enabled: boolean;
  masterVolume: number; // 0-1
  sfxVolume: number; // 0-1
  musicVolume: number; // 0-1
}

const DEFAULT_PREFERENCES: SoundPreferences = {
  enabled: true,
  masterVolume: 0.8,
  sfxVolume: 0.7,
  musicVolume: 0.3,
};

const STORAGE_KEY = "gambit-sound-preferences";

// --- Sprite Definitions ---

interface SpriteDefinition {
  src: string;
  sprite: Record<string, [number, number]>;
}

// These will be loaded from the generated JSON files at init time
const SPRITE_SOURCES: { key: string; wavPath: string; jsonPath: string }[] = [
  {
    key: "ui",
    wavPath: "/sounds/sprites/ui-sprites.wav",
    jsonPath: "/sounds/sprites/ui-sprites.json",
  },
  {
    key: "move",
    wavPath: "/sounds/sprites/move-sprites.wav",
    jsonPath: "/sounds/sprites/move-sprites.json",
  },
  {
    key: "capture",
    wavPath: "/sounds/sprites/capture-sprites.wav",
    jsonPath: "/sounds/sprites/capture-sprites.json",
  },
  {
    key: "event",
    wavPath: "/sounds/sprites/event-sprites.wav",
    jsonPath: "/sounds/sprites/event-sprites.json",
  },
];

// Standalone sounds (not sprites)
const STANDALONE_SOUNDS: { key: SoundKey; src: string }[] = [
  { key: "longshot", src: "/sounds/longshot.wav" },
  { key: "checkmate", src: "/sounds/checkmate.wav" },
  { key: "annihilation", src: "/sounds/annihilation.wav" },
  { key: "defeat", src: "/sounds/defeat.wav" },
  { key: "promotion", src: "/sounds/promotion.wav" },
  { key: "ransom", src: "/sounds/ransom.wav" },
  { key: "game-start", src: "/sounds/game-start.wav" },
];

const MUSIC_TRACKS: { key: MusicKey; src: string; loop: boolean }[] = [
  { key: "ambient-menu", src: "/sounds/ambient-menu.wav", loop: true },
  { key: "ambient-game", src: "/sounds/ambient-game.wav", loop: true },
  { key: "victory-theme", src: "/sounds/victory-theme.wav", loop: false },
];

// --- Sound Manager ---

class SoundManager {
  private sprites: Map<string, Howl> = new Map();
  private standalone: Map<SoundKey, Howl> = new Map();
  private music: Map<MusicKey, Howl> = new Map();
  private soundToSprite: Map<SoundKey, string> = new Map();
  private preferences: SoundPreferences;
  private initialized = false;
  private currentMusic: MusicKey | null = null;
  private currentMusicId: number | null = null;
  private audioUnlocked = false;
  private listeners: Set<() => void> = new Set();
  private snapshotCache: SoundPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
    this.snapshotCache = { ...this.preferences };
  }

  // --- Initialization ---

  async init(): Promise<void> {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    // Load sprite definitions from JSON files and create Howl instances
    for (const source of SPRITE_SOURCES) {
      try {
        const res = await fetch(source.jsonPath);
        const spriteMap: Record<string, [number, number]> = await res.json();

        const howl = new Howl({
          src: [source.wavPath],
          sprite: spriteMap,
          preload: true,
        });

        this.sprites.set(source.key, howl);

        // Map each sound key to its sprite source
        for (const soundName of Object.keys(spriteMap)) {
          this.soundToSprite.set(soundName as SoundKey, source.key);
        }
      } catch (e) {
        console.warn(`Failed to load sprite ${source.key}:`, e);
      }
    }

    // Load standalone sounds
    for (const sound of STANDALONE_SOUNDS) {
      const howl = new Howl({
        src: [sound.src],
        preload: true,
      });
      this.standalone.set(sound.key, howl);
    }

    // Load music tracks
    for (const track of MUSIC_TRACKS) {
      const howl = new Howl({
        src: [track.src],
        loop: track.loop,
        preload: true,
        html5: true, // Use HTML5 audio for music to avoid memory issues
      });
      this.music.set(track.key, howl);
    }

    // Apply initial volumes
    this.applyVolumes();

    // Set up audio unlock for mobile
    this.setupAudioUnlock();

    this.initialized = true;
  }

  // --- Playback ---

  play(
    soundKey: SoundKey,
    options?: { volume?: number; rate?: number },
  ): void {
    if (!this.preferences.enabled || !this.initialized) return;

    const effectiveVolume =
      this.preferences.masterVolume *
      this.preferences.sfxVolume *
      (options?.volume ?? 1);

    // Check if it's a sprite sound
    const spriteKey = this.soundToSprite.get(soundKey);
    if (spriteKey) {
      const howl = this.sprites.get(spriteKey);
      if (howl) {
        const id = howl.play(soundKey);
        howl.volume(effectiveVolume, id);
        if (options?.rate) {
          howl.rate(options.rate, id);
        }
      }
      return;
    }

    // Check standalone sounds
    const howl = this.standalone.get(soundKey);
    if (howl) {
      const id = howl.play();
      howl.volume(effectiveVolume, id);
      if (options?.rate) {
        howl.rate(options.rate, id);
      }
    }
  }

  playMusic(trackKey: MusicKey): void {
    if (!this.preferences.enabled || !this.initialized) return;

    // Stop current music first
    if (this.currentMusic && this.currentMusic !== trackKey) {
      this.stopMusic(300);
    }

    const howl = this.music.get(trackKey);
    if (!howl) return;

    const effectiveVolume =
      this.preferences.masterVolume * this.preferences.musicVolume;

    // Fade in
    howl.volume(0);
    const id = howl.play();
    howl.fade(0, effectiveVolume, 500, id);

    this.currentMusic = trackKey;
    this.currentMusicId = id;
  }

  stopMusic(fadeOutMs = 500): void {
    if (!this.currentMusic) return;

    const howl = this.music.get(this.currentMusic);
    if (howl && this.currentMusicId !== null) {
      const id = this.currentMusicId;
      howl.fade(howl.volume(), 0, fadeOutMs, id);
      setTimeout(() => {
        howl.stop(id);
      }, fadeOutMs);
    }

    this.currentMusic = null;
    this.currentMusicId = null;
  }

  // --- Volume Controls ---

  setMasterVolume(vol: number): void {
    this.preferences.masterVolume = Math.max(0, Math.min(1, vol));
    this.applyVolumes();
    this.savePreferences();
    this.notifyListeners();
  }

  setSfxVolume(vol: number): void {
    this.preferences.sfxVolume = Math.max(0, Math.min(1, vol));
    this.savePreferences();
    this.notifyListeners();
  }

  setMusicVolume(vol: number): void {
    this.preferences.musicVolume = Math.max(0, Math.min(1, vol));
    this.applyVolumes();
    this.savePreferences();
    this.notifyListeners();
  }

  setEnabled(enabled: boolean): void {
    this.preferences.enabled = enabled;
    if (!enabled) {
      this.stopMusic(200);
      Howler.mute(true);
    } else {
      Howler.mute(false);
    }
    this.savePreferences();
    this.notifyListeners();
  }

  toggleEnabled(): void {
    this.setEnabled(!this.preferences.enabled);
  }

  getPreferences(): SoundPreferences {
    return this.snapshotCache;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isAudioUnlocked(): boolean {
    return this.audioUnlocked;
  }

  // --- Subscriptions (for React) ---

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.snapshotCache = { ...this.preferences };
    for (const listener of this.listeners) {
      listener();
    }
  }

  // --- Mobile Audio Unlock ---

  private setupAudioUnlock(): void {
    if (typeof window === "undefined") return;

    // Check if already unlocked
    const ctx = Howler.ctx;
    if (ctx && ctx.state === "running") {
      this.audioUnlocked = true;
      return;
    }

    const unlock = () => {
      if (this.audioUnlocked) return;

      // Resume AudioContext
      const audioCtx = Howler.ctx;
      if (audioCtx && audioCtx.state !== "running") {
        audioCtx.resume().then(() => {
          this.audioUnlocked = true;
          this.notifyListeners();
        });
      } else {
        this.audioUnlocked = true;
        this.notifyListeners();
      }

      // Remove listeners after unlock
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("touchend", unlock, true);
      document.removeEventListener("click", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };

    document.addEventListener("touchstart", unlock, true);
    document.addEventListener("touchend", unlock, true);
    document.addEventListener("click", unlock, true);
    document.addEventListener("keydown", unlock, true);
  }

  // --- Persistence ---

  private loadPreferences(): SoundPreferences {
    if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch {
      // Ignore parse errors
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private savePreferences(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch {
      // Ignore storage errors
    }
  }

  private applyVolumes(): void {
    // Update currently playing music volume
    if (this.currentMusic && this.currentMusicId !== null) {
      const howl = this.music.get(this.currentMusic);
      if (howl) {
        const effectiveVolume =
          this.preferences.masterVolume * this.preferences.musicVolume;
        howl.volume(effectiveVolume, this.currentMusicId);
      }
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();
