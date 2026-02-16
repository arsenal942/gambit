"use client";

import { useScrollReveal } from "./useScrollReveal";

const features = [
  {
    title: "The River Changes Everything",
    description:
      "Row F divides the board into two halves. Cross it and the rules change. Footmen gain promotion rights. Archers extend their range. Every river crossing is a strategic commitment.",
    visual: RiverVisual,
  },
  {
    title: "Capture Points, Not Checkmate",
    description:
      "Four capture points line the river at F1, F4, F7, and F10. Hold three for a full turn and you win. There is no king to hide\u2014victory demands territory.",
    visual: CapturePointVisual,
  },
  {
    title: "Three Paths to Victory",
    description:
      "Annihilate every enemy piece. Control three capture points. Or outplay your opponent until they resign. Each path requires a different strategy.",
    visual: VictoryPathsVisual,
  },
];

export function MechanicsSection() {
  return (
    <section className="bg-gray-800/30 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-amber-100 sm:text-4xl">
          What Makes Gambit Different
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">
          Not just another chess variant. Gambit introduces mechanics that
          change how you think about strategy.
        </p>

        <div className="mt-16 space-y-20">
          {features.map((feature, i) => (
            <FeatureBlock key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const { ref, isVisible } = useScrollReveal();
  const isReversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-8 md:flex-row ${
        isReversed ? "md:flex-row-reverse" : ""
      } transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-amber-100">{feature.title}</h3>
        <p className="mt-3 leading-relaxed text-gray-400">
          {feature.description}
        </p>
      </div>
      <div className="flex flex-1 justify-center">
        <feature.visual />
      </div>
    </div>
  );
}

function RiverVisual() {
  return (
    <svg
      viewBox="0 0 240 160"
      className="w-full max-w-[240px] drop-shadow-lg"
    >
      {/* Board tiles above river */}
      {[0, 1, 2, 3, 4, 5].map((col) => (
        <rect
          key={`top-${col}`}
          x={col * 40}
          y={0}
          width={40}
          height={50}
          fill={col % 2 === 0 ? "#F5E6C8" : "#8B6914"}
          opacity={0.6}
        />
      ))}
      {/* River row */}
      {[0, 1, 2, 3, 4, 5].map((col) => (
        <rect
          key={`river-${col}`}
          x={col * 40}
          y={50}
          width={40}
          height={50}
          fill={col % 2 === 0 ? "#7BC4C4" : "#3D7A7A"}
          opacity={0.8}
        />
      ))}
      {/* Board tiles below river */}
      {[0, 1, 2, 3, 4, 5].map((col) => (
        <rect
          key={`bottom-${col}`}
          x={col * 40}
          y={100}
          width={40}
          height={50}
          fill={col % 2 === 0 ? "#F5E6C8" : "#8B6914"}
          opacity={0.6}
        />
      ))}
      {/* River label */}
      <text
        x={120}
        y={80}
        textAnchor="middle"
        fill="#FAF0DC"
        fontSize="14"
        fontWeight="bold"
        opacity={0.9}
      >
        THE RIVER
      </text>
      {/* Arrows crossing */}
      <line
        x1={60}
        y1={30}
        x2={60}
        y2={130}
        stroke="#FACC15"
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.6}
      />
      <polygon points="56,130 60,140 64,130" fill="#FACC15" opacity={0.6} />
      <line
        x1={180}
        y1={130}
        x2={180}
        y2={30}
        stroke="#FACC15"
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.6}
      />
      <polygon points="176,30 180,20 184,30" fill="#FACC15" opacity={0.6} />
    </svg>
  );
}

function CapturePointVisual() {
  return (
    <svg
      viewBox="0 0 240 80"
      className="w-full max-w-[240px] drop-shadow-lg"
    >
      {/* River background */}
      <rect x={0} y={0} width={240} height={80} rx={8} fill="#3D7A7A" opacity={0.5} />
      {/* Four capture points */}
      {[30, 90, 150, 210].map((cx, i) => (
        <g key={i}>
          <polygon
            points={`${cx},15 ${cx + 15},40 ${cx},65 ${cx - 15},40`}
            fill={i < 3 ? "#FACC15" : "#6B7280"}
            stroke={i < 3 ? "#F59E0B" : "#4B5563"}
            strokeWidth={2}
            opacity={0.9}
          />
          <text
            x={cx}
            y={44}
            textAnchor="middle"
            fill={i < 3 ? "#1a1a2e" : "#9CA3AF"}
            fontSize="12"
            fontWeight="bold"
          >
            F{[1, 4, 7, 10][i]}
          </text>
        </g>
      ))}
      {/* "3 of 4" label */}
      <text
        x={120}
        y={78}
        textAnchor="middle"
        fill="#FCD34D"
        fontSize="10"
        opacity={0.7}
      >
        Hold 3 to win
      </text>
    </svg>
  );
}

function VictoryPathsVisual() {
  const paths = [
    { icon: "sword", label: "Annihilation", color: "#EF4444" },
    { icon: "flag", label: "Checkmate", color: "#FACC15" },
    { icon: "hand", label: "Forfeit", color: "#9CA3AF" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {paths.map((path) => (
        <div key={path.label} className="flex flex-col items-center gap-2">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2"
            style={{ borderColor: path.color }}
          >
            {path.icon === "sword" && (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={path.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="20" x2="18" y2="6" />
                <line x1="15" y1="3" x2="21" y2="9" />
                <line x1="18" y1="6" x2="15" y2="3" />
              </svg>
            )}
            {path.icon === "flag" && (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={path.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            )}
            {path.icon === "hand" && (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={path.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 11V6a2 2 0 0 0-4 0v1" />
                <path d="M14 10V4a2 2 0 0 0-4 0v6" />
                <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
            )}
          </div>
          <span className="text-xs text-gray-400">{path.label}</span>
        </div>
      ))}
    </div>
  );
}
