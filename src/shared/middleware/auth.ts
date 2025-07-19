// src/shared/middleware/auth.ts
import jwt from "jsonwebtoken";
import { CONFIG } from "../../config";
import { logger } from "../logger";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function authenticateToken(token?: string): AuthUser | null {
  if (!token) {
    logger.warn("No token provided");
    return null;
  }

  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    logger.error("Invalid token", error as Error);
    return null;
  }
}
