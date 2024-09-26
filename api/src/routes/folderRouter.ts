import express, { Request, Response } from "express";
import db from "../db.js";

const router = express.Router();

router.get("/getFolder/:folderID", async (req: Request, res: Response) => {
  const { folderID } = req.params;
  try {
    const folder = await db.getFolderName(folderID);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }
    const files = await db.getFolderFiles(folderID);
    res.json({ name: folder, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
});

export default router;
