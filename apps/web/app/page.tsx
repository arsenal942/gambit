import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight text-amber-100">
          Gambit
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          A tactical strategy board game
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/game/local"
          className="rounded-lg bg-amber-700 px-8 py-3 text-center text-lg font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Play Local Game
        </Link>
        <Link
          href="/game/online"
          className="rounded-lg bg-gray-700 px-8 py-3 text-center text-lg font-semibold text-white transition-colors hover:bg-gray-600"
        >
          Play Online
        </Link>
      </div>
    </main>
  );
}
