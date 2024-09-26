import express, { Request, Response } from "express";
import db from "../db.js";

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
    const { query } = req.query;
  
    if (!query) {
      res.status(400).json({ error: "Query parameter is required" });
      return;
    }
  
    try {
      const results = await db.searchFiles(query as string);
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: true });
    }
  });

export default router;
