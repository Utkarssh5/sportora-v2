import jwt, { type JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../modules/users/models/user.model.js";

export interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

const JWT_SECRET =
  process.env.JWT_SECRET || "sportora-super-secret-key";

const JWT_EXPIRES_IN = "15m";

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "sportora-refresh-secret";

const REFRESH_EXPIRES_IN = "7d";

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.id !== "string" ||
    typeof decoded.email !== "string" ||
    typeof decoded.role !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }

  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
