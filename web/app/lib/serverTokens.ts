import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateServerToken(id: string): string {
  return jwt.sign({ source: "website", id }, JWT_SECRET, { expiresIn: "5m" });
}

export function verifyServerToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}
