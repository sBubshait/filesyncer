import express, { Request, Response } from "express";
import db from "../db/index.js";

const router = express.Router();

router.get("/getFolder/:folderID", async (req: Request, res: Response) => {
  const { folderID } = req.params;
  try {
    const folder = await db.folder.get(folderID);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    const files = await db.folder.getContents(folderID);
    res.json({ name: folder.folderName, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
});

export default router;
