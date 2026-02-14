"use client";

import { useParams, redirect } from "next/navigation";
import { getLessonById } from "@/lib/tutorial/lessons";
import { TutorialClient } from "@/components/tutorial/TutorialClient";
import { PracticeGameClient } from "@/components/tutorial/PracticeGameClient";

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  const lesson = getLessonById(lessonId);

  if (!lesson) {
    redirect("/tutorial");
  }

  // Lesson 8 (practice game) uses a special client
  if (lesson.id === "practice-game") {
    return <PracticeGameClient />;
  }

  return <TutorialClient lesson={lesson} />;
}
