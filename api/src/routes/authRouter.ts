import express, { Request, Response } from "express";
import { generateToken } from "../utils/auth.js";
import dotenv from "dotenv";
import { getEnvPath } from "../utils/envPath.js";
dotenv.config({ path: getEnvPath() });

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username !== process.env.USERNAME || password !== process.env.PASSWORD)
    return res.status(401).json({ message: "Invalid credentials" });

  try {
    const token = generateToken({ id: 1, username: username });
    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true });
  }
});

export default router;
