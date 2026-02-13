"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

export interface ActiveGame {
  id: string;
  roomId: string | null;
  opponentUsername: string;
  startedAt: string | null;
}

export function useActiveGames(): {
  activeGames: ActiveGame[];
  loading: boolean;
} {
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setActiveGames([]);
      setLoading(false);
      return;
    }

    async function fetchActiveGames() {
      try {
        const supabase = createClient();
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: games } = await supabase
          .from("games")
          .select(
            `
            id,
            room_id,
            white_player_id,
            black_player_id,
            started_at,
            white_profile:profiles!games_white_player_id_fkey(username),
            black_profile:profiles!games_black_player_id_fkey(username)
          `,
          )
          .eq("status", "playing")
          .or(
            `white_player_id.eq.${user!.id},black_player_id.eq.${user!.id}`,
          )
          .order("started_at", { ascending: false });

        if (games) {
          const mapped: ActiveGame[] = (games as unknown as Array<{
            id: string;
            room_id: string | null;
            white_player_id: string | null;
            black_player_id: string | null;
            started_at: string | null;
            white_profile: { username: string } | null;
            black_profile: { username: string } | null;
          }>).map((g) => {
            const isWhite = g.white_player_id === user!.id;
            const opponent = isWhite
              ? g.black_profile?.username ?? "Anonymous"
              : g.white_profile?.username ?? "Anonymous";
            return {
              id: g.id,
              roomId: g.room_id,
              opponentUsername: opponent,
              startedAt: g.started_at,
            };
          });
          setActiveGames(mapped);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchActiveGames();
  }, [user]);

  return { activeGames, loading };
}
