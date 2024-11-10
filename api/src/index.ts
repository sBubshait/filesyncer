import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRouter.js";
import fileRoutes from "./routes/fileRouter.js";
import folderRoutes from "./routes/folderRouter.js";
import sectionRoutes from "./routes/sectionRouter.js";
import searchRoutes from "./routes/searchRouter.js";
import authMiddleware from "./utils/authMiddleware.js";
import { setupWebSocketServer } from "./websocket.js";
import "./utils/bigIntJSON.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(authMiddleware);

// Routers
app.use(authRoutes);
app.use(fileRoutes);
app.use(folderRoutes);
app.use(sectionRoutes);
app.use(searchRoutes);

// Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  setupWebSocketServer(server);
});
