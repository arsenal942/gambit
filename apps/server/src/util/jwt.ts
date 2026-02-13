import { supabaseAdmin } from "../lib/supabase.js";

/**
 * Verifies a Supabase JWT and returns the user's UUID, or null if invalid
 * or Supabase is not configured.
 */
export async function verifySupabaseJwt(
  jwt: string,
): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(jwt);
  if (error || !data.user) return null;
  return data.user.id;
}
