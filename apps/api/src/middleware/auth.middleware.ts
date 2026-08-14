import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("Authorization Header:", req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const decodedUser = verifyAccessToken(token);

    req.user = decodedUser;

    next();
  } catch (error) {
    console.log("JWT ERROR:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

/**
 * Role Based Authorization
 */
export function authorize(...roles: string[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user as any;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to access this resource",
      });
    }

    next();
  };
}