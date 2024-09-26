import express, { Request, Response } from "express";
import { generateToken } from "../utils/auth.js";
import dotenv from "dotenv";
import { getEnvPath } from "../utils/envPath.js";
dotenv.config({ path: getEnvPath() });

const router = express.Router();

const credentials = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
};

router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
  
    if (username !== credentials.username || password !== credentials.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    const token = generateToken({ id: 1, username: credentials.username });
  
    return res.json({ token });
});

export default router;
