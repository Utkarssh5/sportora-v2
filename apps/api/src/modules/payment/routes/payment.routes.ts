import { Router } from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create-order",
  authMiddleware,
  createOrder
);

router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);

export default router;
