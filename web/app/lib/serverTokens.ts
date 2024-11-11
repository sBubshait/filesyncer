import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('SERVER_SECRET environment variable is required');
}

export function generateServerToken(id: string): string {
  return jwt.sign({ source: 'website', id }, JWT_SECRET, { expiresIn: '5m' });
}

export function verifyServerToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}