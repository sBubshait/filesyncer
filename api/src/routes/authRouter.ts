import express, { Request, Response } from "express";
import db from "../db/index.js";
import { generateToken } from "../utils/auth.js";
import dotenv from "dotenv";
import { getEnvPath } from "../utils/envPath.js";
import { AWSConfig, validateAWSConfig } from "../aws.js";
import { decodeServerToken, generateApiKey } from "../utils/auth.js";

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

router.post("/validateAWSConfig", async (req: Request, res: Response) => {
  try {
    const awsConfig: AWSConfig = req.body;

    if (
      !awsConfig.accessKeyId ||
      !awsConfig.secretAccessKey ||
      !awsConfig.bucketName ||
      !awsConfig.region
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required AWS configuration parameters",
      });
    }

    const isValid = await validateAWSConfig(awsConfig);

    return res.status(200).json({
      success: isValid,
      message: isValid
        ? "AWS credentials are valid"
        : "AWS credentials are invalid",
    });
  } catch (error) {
    console.error("Endpoint error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while validating AWS credentials",
    });
  }
});

router.post("/getAPIKey", async (req: Request, res: Response) => {
  console.log("Request!");
  try {
    const { id, provider, secret } = req.body;

    if (!id || !provider || !secret) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const decoded = decodeServerToken(secret);
    if (!decoded || decoded.source !== "website" || decoded.id !== id)
      return res.status(401).json({ error: "Unauthorized Request" });

    const existingUser = await db.user.get(id);
    if (existingUser && existingUser.apiKey) {
      return res.json({ apiKey: existingUser.apiKey });
    }

    const apiKey = generateApiKey();
    console.log("Generated API key:", apiKey);

    await db.user.create({
      id,
      provider,
      apiKey,
    });

    return res.json({ apiKey });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
