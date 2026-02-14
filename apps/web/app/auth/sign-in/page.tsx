"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthForm } from "@/components/auth/AuthForm";

function SignInContent() {
  const { loading, isConfigured } = useAuth();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  if (!isConfigured) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400">
          Authentication is not configured. Set Supabase environment variables
          to enable accounts.
        </p>
        <Link
          href="/"
          className="text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-3xl font-bold text-amber-100">
          Welcome Back
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Sign in to continue your games
        </p>

        <AuthForm mode="signin" initialError={urlError} />

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-amber-400 transition-colors hover:text-amber-300"
          >
            Sign Up
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="text-sm text-gray-500 transition-colors hover:text-gray-300"
      >
        Back to Home
      </Link>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </main>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
