import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
  reconnectGracePeriodMs: 60_000,
  supabaseUrl: process.env.SUPABASE_URL ?? null,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
};
