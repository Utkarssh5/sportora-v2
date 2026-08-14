import { errorHandler } from "./middlewares/error.middleware.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import pinoHttpModule from "pino-http";

import { swaggerUi, swaggerSpec } from "./docs/swagger.js";

import { authRoutes } from "./modules/auth/routes/auth.routes.js";
import userRoutes from "./modules/users/routes/user.routes.js";

import tournamentRoutes from "./modules/tournaments/routes/tournament.routes.js";
import tournamentRegistrationRoutes from "./modules/tournamentRegistration/routes/tournamentRegistration.routes.js";
import crewRoutes from "./modules/crew/routes/crew.routes.js";
import aiRoutes from "./modules/ai/routes/ai.routes.js";
import paymentRoutes from "./modules/payment/routes/payment.routes.js";
import matchRoutes from "./modules/match/routes/match.routes.js";
import organizerVerificationRoutes from "./modules/organizerVerification/routes/organizerVerification.routes.js";
const pinoHttp = pinoHttpModule.default ?? pinoHttpModule;

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(pinoHttp());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/swagger.json", (_req, res) => {
  res.json(swaggerSpec);
});

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
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tournament-registration", tournamentRegistrationRoutes);
app.use("/api/v1/tournament", tournamentRoutes);
app.use("/api/v1/crew", crewRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/match", matchRoutes);

/* Sprint 5 */
app.use("/api/v1", organizerVerificationRoutes);

/* Error Handler - ALWAYS LAST */
app.use(errorHandler);

export default app;