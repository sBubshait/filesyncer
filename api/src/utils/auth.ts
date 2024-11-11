import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { getEnvPath } from "../utils/envPath.js";
dotenv.config({ path: getEnvPath() });

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function generateToken(user: any) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export interface TokenPayload {
  source: string;
  id: string;
}

export function decodeServerToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export function generateApiKey(): string {
  const payload = {
    timestamp: Date.now(),
    type: "api_key",
  };
  return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });
}

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: "Unauthorized: No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Forbidden: Invalid token" });
  }
}
