import express, { Request, Response } from "express";
import db from "../db.js";

const router = express.Router();

router.get("/getSection/home", async (req: Request, res: Response) => {
  try {
    // Find all folders with no parent
    const homeFolders = await db.getHomeFolders();
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
