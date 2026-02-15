"use client";

import { useSoundPreferences } from "@/hooks/useSoundPreferences";

interface SoundSettingsProps {
  onClose: () => void;
}

export function SoundSettings({ onClose }: SoundSettingsProps) {
  const {
    preferences,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setEnabled,
    testSound,
  } = useSoundPreferences();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div
        className="fixed inset-0 z-[60]"
        onClick={onClose}
      />
      <div className="relative z-[70] w-full max-w-sm rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-100">Sound Settings</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Master mute toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Sound Enabled</span>
            <button
              onClick={() => setEnabled(!preferences.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.enabled ? "bg-amber-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Master Volume */}
          <VolumeSlider
            label="Master Volume"
            value={preferences.masterVolume}
            onChange={setMasterVolume}
            disabled={!preferences.enabled}
          />

          {/* SFX Volume */}
          <VolumeSlider
            label="SFX Volume"
            value={preferences.sfxVolume}
            onChange={setSfxVolume}
            disabled={!preferences.enabled}
          />

          {/* Music Volume */}
          <VolumeSlider
            label="Music Volume"
            value={preferences.musicVolume}
            onChange={setMusicVolume}
            disabled={!preferences.enabled}
          />

          {/* Test Sound */}
          <button
            onClick={testSound}
            disabled={!preferences.enabled}
            className="w-full rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Test Sound
          </button>
        </div>
      </div>
    </div>
  );
}

function VolumeSlider({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  disabled: boolean;
}) {
  const pct = Math.round(value * 100);

  return (
    <div className={disabled ? "opacity-40" : ""}>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-xs text-gray-500">{pct}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-600 accent-amber-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}
