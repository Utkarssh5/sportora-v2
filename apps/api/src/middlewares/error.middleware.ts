import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  void _next;
  console.error(err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues,
    });
  }

  // Duplicate Email
  if (err.message === "Email already exists") {
    return res.status(409).json({
      success: false,
      message: err.message,
    });
  }

  // Invalid Login
  if (err.message === "Invalid email or password") {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }

  // Payment Gateway Configuration
  if (err.message === "Payment gateway is not configured.") {
    return res.status(503).json({
      success: false,
      message: err.message,
    });
  }

  // Default Error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
