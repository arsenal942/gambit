"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // Redirect if not logged in, or already has profile
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
      } else if (profile) {
        router.push("/");
      }
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setError("Username must be 3-20 characters");
      return;
    }

    setSubmitting(true);

    try {
      if (!supabase) throw new Error("Not configured");
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user!.id,
        username: trimmed,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("Username is already taken");
        } else {
          setError(insertError.message);
        }
        return;
      }

      await refreshProfile();
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
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
          Choose a Username
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          This will be your public display name.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (3-20 characters)"
            required
            minLength={3}
            maxLength={20}
            className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none ring-1 ring-gray-700 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-40"
          >
            {submitting ? "Creating..." : "Continue"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}
      </div>
    </main>
  );
}
