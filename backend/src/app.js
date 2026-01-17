import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { statsRoutes } from "./routes/stats.routes.js";
import { statusRoutes } from "./routes/status.routes.js";
import { legalRoutes } from "./routes/legal.routes.js";
import { subscriptionRoutes } from "./routes/subscription.routes.js";
import { errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/subscription", subscriptionRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/stats", statsRoutes);
  app.use("/status", statusRoutes);
  app.use("/legal", legalRoutes);

  app.use(errorHandler);
  return app;
}
