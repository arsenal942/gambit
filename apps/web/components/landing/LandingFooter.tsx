import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-800 px-4 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
        {/* Branding */}
        <div>
          <p className="text-lg font-bold text-amber-100">Gambit</p>
          <p className="mt-2 text-sm text-gray-500">
            A tactical strategy board game by Snowkey Studios.
          </p>
        </div>

        {/* Play links */}
        <div>
          <p className="text-sm font-semibold text-gray-300">Play</p>
          <nav className="mt-3 flex flex-col gap-2">
            <Link
              href="/tutorial"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Tutorial
            </Link>
            <Link
              href="/game/bot"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Play vs Bot
            </Link>
            <Link
              href="/game/online"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Play Online
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Leaderboard
            </Link>
          </nav>
        </div>

        {/* External links */}
        <div>
          <p className="text-sm font-semibold text-gray-300">Links</p>
          <nav className="mt-3 flex flex-col gap-2">
            <a
              href="https://snowkeystudios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Snowkey Studios
            </a>
            <a
              href="https://www.kickstarter.com/projects/snowkeystudios/blackheart-the-spellforge-saga"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Blackheart Kickstarter
            </a>
            <Link
              href="/legal"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Terms &amp; Privacy
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl border-t border-gray-800 pt-6">
        <p className="text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Snowkey Studios. All rights
          reserved. &middot;{" "}
          <Link
            href="/legal"
            className="text-gray-600 transition-colors hover:text-gray-400"
          >
            Terms &amp; Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}
