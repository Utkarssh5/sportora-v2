import { Router } from "express";
import { sportsController } from "../controllers/sports.controller.js";

const router = Router();

router.get("/config", (req, res) =>
  sportsController.getConfig(req, res),
);

router.get("/:sport/competitions", (req, res) =>
  sportsController.getCompetitions(req, res),
);

export default router;
