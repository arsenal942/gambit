"use client";

import { useEffect, useState, useCallback } from "react";
import { useScrollReveal } from "./useScrollReveal";

const stats = [
  { label: "Players", value: 500, suffix: "+" },
  { label: "Games Played", value: 2000, suffix: "+" },
  { label: "Tutorial Lessons", value: 8, suffix: "" },
];

export function StatsSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <div
          ref={ref}
          className={`grid grid-cols-1 gap-8 sm:grid-cols-3 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <CountUp target={stat.value} active={isVisible} suffix={stat.suffix} />
              <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({
  target,
  active,
  suffix,
}: {
  target: number;
  active: boolean;
  suffix: string;
}) {
  const [count, setCount] = useState(0);

  const animate = useCallback(() => {
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [target]);

  useEffect(() => {
    if (active) {
      animate();
    }
  }, [active, animate]);

  return (
    <span className="text-4xl font-bold text-amber-100">
      {active ? count.toLocaleString() : "0"}
      {active && count === target ? suffix : ""}
    </span>
  );
}
