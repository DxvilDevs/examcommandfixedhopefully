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
import { planRoutes } from "./routes/plan.routes.js";
import { focusRoutes } from "./routes/focus.routes.js";
import { alertsRoutes } from "./routes/alerts.routes.js"; // ✅ ADD

export function createApp() {
  const app = express();

  /* ======================
     CORS (safe for GitHub Pages)
  ====================== */
  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://dxvildevs.github.io"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/subscription", subscriptionRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/stats", statsRoutes);
  app.use("/status", statusRoutes);
  app.use("/legal", legalRoutes);
  app.use("/plan", planRoutes);
  app.use("/focus", focusRoutes);

  // ✅ ADD alerts stub
  app.use("/alerts", alertsRoutes);

  app.use(errorHandler);

  return app;
}
