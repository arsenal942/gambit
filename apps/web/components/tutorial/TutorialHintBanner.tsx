"use client";

interface TutorialHintBannerProps {
  text: string;
}

export function TutorialHintBanner({ text }: TutorialHintBannerProps) {
  return (
    <div className="tutorial-coach-enter rounded-lg border border-blue-800/30 bg-blue-950/70 px-4 py-2.5 text-center">
      <p className="text-sm text-blue-300">
        <span className="mr-1.5">&#128161;</span>
        {text}
      </p>
    </div>
  );
}
