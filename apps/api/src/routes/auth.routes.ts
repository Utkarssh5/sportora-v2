import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", (req, res) => {
  userController.register(req, res);
});

export default router;