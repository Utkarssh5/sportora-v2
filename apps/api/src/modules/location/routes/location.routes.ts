import { Router } from "express";

import {
  getByCity,
  getByState,
  getStates,
  searchLocations,
} from "../controllers/location.controller.js";

const router = Router();

router.get("/search", searchLocations);
router.get("/states", getStates);
router.get("/city", getByCity);
router.get("/state", getByState);

export default router;
