import type { Metadata } from "next";
import { PuzzleClient } from "@/components/puzzle/PuzzleClient";

export const metadata: Metadata = {
  title: "Daily Puzzle — Gambit",
  description:
    "Solve today's Gambit puzzle! Test your tactical skills with daily board challenges.",
};

export default function PuzzlePage() {
  return <PuzzleClient />;
}
