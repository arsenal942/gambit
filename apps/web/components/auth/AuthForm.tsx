"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

interface AuthFormProps {
  mode: "signin" | "signup";
  initialError?: string | null;
}

export function AuthForm({ mode, initialError = null }: AuthFormProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (!profile) {
        router.push("/auth/profile-setup");
      } else {
        router.push("/");
      }
    }
  }, [user, profile, loading, router]);

  // Sync initialError prop changes
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email for a confirmation link.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!supabase) return;
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <>
      {/* Google OAuth */}
      <button
        onClick={handleGoogleAuth}
        className="mb-4 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
      >
        Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-700" />
        <span className="text-xs text-gray-500">or</span>
        <div className="h-px flex-1 bg-gray-700" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none ring-1 ring-gray-700 focus:ring-amber-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none ring-1 ring-gray-700 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-40"
        >
          {submitting
            ? mode === "signin"
              ? "Signing in..."
              : "Creating account..."
            : mode === "signin"
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-center text-sm text-red-400">{error}</p>
      )}
      {message && (
        <p className="mt-3 text-center text-sm text-green-400">{message}</p>
      )}
    </>
  );
}
