import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";

import authRoutes from "./modules/auth/routes/auth.routes.js";
import organizerRoutes from "./routes/organizer.routes.js";
import tournamentRoutes from "./routes/tournament.routes.js";
import crewRoutes from "./routes/crew.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import matchRoutes from "./routes/match.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(pinoHttp());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Sportora API is running 🚀",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "sportora-api",
    version: "1.0.0",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organizer", organizerRoutes);
app.use("/api/v1/tournament", tournamentRoutes);
app.use("/api/v1/crew", crewRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/match", matchRoutes);

export default app;