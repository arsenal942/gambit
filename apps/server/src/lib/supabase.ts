import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config.js";

const supabaseUrl = config.supabaseUrl;
const supabaseServiceKey = config.supabaseServiceKey;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase env vars not set — game persistence disabled");
}

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;
