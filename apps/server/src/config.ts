export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
  reconnectGracePeriodMs: 60_000,
  supabaseUrl: process.env.SUPABASE_URL ?? null,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
};
