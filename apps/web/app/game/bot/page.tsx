"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllBotProfiles, type BotProfile, type Player } from "@gambit/engine";
import { BotGameClient } from "@/components/game/BotGameClient";

const DIFFICULTY_STARS: Record<string, number> = {
  squire: 1,
  soldier: 2,
  captain: 3,
  commander: 4,
  warlord: 5,
};

function BotSetupScreen({
  onStart,
}: {
  onStart: (config: { botProfile: BotProfile; playerColor: Player }) => void;
}) {
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null);
  const [selectedColor, setSelectedColor] = useState<Player | "random">(
    "white",
  );
  const profiles = getAllBotProfiles();

  function handleStart() {
    if (!selectedBot) return;
    const color: Player =
      selectedColor === "random"
        ? Math.random() < 0.5
          ? "white"
          : "black"
        : selectedColor;
    onStart({ botProfile: selectedBot, playerColor: color });
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-100">Play vs Bot</h1>
        <p className="mt-2 text-sm text-gray-400">
          Choose your opponent and preferred color
        </p>
      </div>

      {/* Bot selection grid */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => {
          const isSelected = selectedBot?.id === profile.id;
          const stars = DIFFICULTY_STARS[profile.id] ?? 1;

          return (
            <button
              key={profile.id}
              onClick={() => setSelectedBot(profile)}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                isSelected
                  ? "border-amber-500 bg-gray-800"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-amber-100">
                  {profile.name}
                </span>
                <span className="text-sm text-gray-500">{profile.rating}</span>
              </div>
              <div className="mt-1 text-xs text-amber-400">
                {"★".repeat(stars)}
                {"☆".repeat(5 - stars)}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {profile.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Color selection */}
      {selectedBot && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm text-gray-400">Play as:</span>
          <div className="flex gap-2">
            {(["white", "black", "random"] as const).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  selectedColor === color
                    ? "bg-amber-700 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleStart}
          disabled={!selectedBot}
          className="rounded-lg bg-amber-700 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start Game
        </button>
        <Link
          href="/"
          className="text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function BotGamePage() {
  const [config, setConfig] = useState<{
    botProfile: BotProfile;
    playerColor: Player;
  } | null>(null);

  if (config) {
    return <BotGameClient config={config} onBack={() => setConfig(null)} />;
  }

  return <BotSetupScreen onStart={setConfig} />;
}
