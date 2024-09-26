import { Request, Response, NextFunction } from "express";
import { authenticateJWT } from "./auth.js";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path === "/login") {
        return next();
    }
    authenticateJWT(req, res, next);
}
