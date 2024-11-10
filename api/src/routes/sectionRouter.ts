import express, { Request, Response } from "express";
import db from "../db/index.js";
import { convertBytes } from "../utils/sizeConverter.js";

const storageLimit = process.env.STORAGE_LIMIT || 100;
const storageType = process.env.STORAGE_TYPE || "MB";

const router = express.Router();

router.get("/getOverview", async (req: Request, res: Response) => {
  try {
    const { fileCount, favouriteCount, totalSize } = await db.getOverview();

    const storage = {
      used: convertBytes(Number(totalSize), storageType),
      total: storageLimit,
      type: storageType,
    };

    res.json({ fileCount, favouriteCount, storage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  }
});

router.get("/getSection/home", async (req: Request, res: Response) => {
  try {
    // Find all folders with no parent
    const homeFolders = await db.getHomeFiles();
    res.json(homeFolders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  }
});

router.get("/getSection/recent", async (req: Request, res: Response) => {
  try {
    const section = await db.getRecentFiles();
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  }
});

router.get("/getSection/favourites", async (req: Request, res: Response) => {
  try {
    const section = await db.getFavouriteFiles();
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  }
});

export default router;
