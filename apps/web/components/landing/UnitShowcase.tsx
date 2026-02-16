"use client";

import { FootmanSolid, ArcherSolid, KnightSolid } from "./DecorativePieces";
import { useScrollReveal } from "./useScrollReveal";

const units = [
  {
    name: "Footman",
    Icon: FootmanSolid,
    accent: "border-action-pushback",
    description:
      "The backbone of your army. Push enemies off capture points with brute force. March deep into enemy territory to promote and recover your fallen allies.",
  },
  {
    name: "Archer",
    Icon: ArcherSolid,
    accent: "border-action-longshot",
    description:
      "Strike from a distance through screen pieces. The archer\u2019s longshot can eliminate threats without ever crossing the river.",
  },
  {
    name: "Knight",
    Icon: KnightSolid,
    accent: "border-action-move",
    description:
      "Leap behind enemy lines with L-shaped movement. Capture enemy knights and hold them for ransom\u2014or sacrifice them for position.",
  },
];

export function UnitShowcase() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-amber-100 sm:text-4xl">
          Three Units. Infinite Strategy.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">
          Each piece plays differently. Master all three to dominate the
          battlefield.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {units.map((unit, i) => (
            <UnitCard key={unit.name} unit={unit} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}

function UnitCard({
  unit,
  delay,
}: {
  unit: (typeof units)[number];
  delay: number;
}) {
  const { ref, isVisible } = useScrollReveal({ delay });

  return (
    <div
      ref={ref}
      className={`rounded-xl border-t-2 ${unit.accent} border border-gray-700/50 bg-gray-800/60 p-8 text-center transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex justify-center">
        <unit.Icon size={80} />
      </div>
      <h3 className="mt-4 text-xl font-bold text-amber-100">{unit.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-400">
        {unit.description}
      </p>
    </div>
  );
}
