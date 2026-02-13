export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
  reconnectGracePeriodMs: 60_000,
};
