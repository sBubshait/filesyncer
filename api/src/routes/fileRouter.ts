import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/db.js";
import { findMostSimilarFolder, linkFolders } from "../utils/addFileUtils.js";
import { generateDownloadLink } from "../aws.js"
import { broadcastMessage } from "../websocket.js";
import * as dotenv from "dotenv";
import { convertBytes } from "../utils/sizeConverter.js";
dotenv.config();

const router = express.Router();

const storageLimit = process.env.STORAGE_LIMIT || 100;
const storageType = process.env.STORAGE_TYPE || "MB";

router.get("/getOverview", async (req: Request, res: Response) => {
  const overview = await db.getOverview();

  const storage = {
    used: convertBytes(overview.storageUsed, storageType),
    total: storageLimit,
    type: storageType,
  }

  res.json({ fileCount: overview.files, favouriteCount: overview.favourites, storage });
});

router.get("/getFileID", async (req: Request, res: Response) => {
  const { pathname } = req.query;
  const fileID = await db.findFileByPath(pathname as string);
  res.json({ fileID });
});

router.post("/addFile", addFile);

router.get("/downloadFile/:fileID", async (req: Request, res: Response) => {
  const { fileID } = req.params;
  try {
    const file = await db.getFile(fileID);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const downloadLink = generateDownloadLink(
      fileID,
      file.fileName + "." + file.fileType
    );
    res.json({ link: downloadLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
});

router.post("/toggleFavourite", async (req: Request, res: Response) => {
  const { fileID } = req.body;
  try {
    const file = await db.getFile(fileID);
    const folder = await db.getFolder(fileID);

    if (!file && !folder) {
      res.status(404).json({ error: "File or folder not found" });
      return;
    }

    if (file) {
      await db.toggleFavouriteFile(fileID);
    } else {
      await db.toggleFavouriteFolder(fileID);
    }

    res.json({ toggled: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ toggled: false });
  }
});

router.post("/deleteFile", async (req: Request, res: Response) => {
  const { fileID } = req.body;
  try {
    await db.deleteFile(fileID);

    broadcastMessage({
      action: "deleteFile",
      fileID,
    });
    res.json({ deleted: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ deleted: false });
  }
});

async function addFile(req: Request, res: Response) {
  const { pathname, size } = req.body;

  if (!pathname) {
    res.status(400).json({ added: false });
    return;
  }

  const fileParts = pathname
    .substring(pathname.lastIndexOf("/") + 1)
    .split(".");
  const filename = fileParts[0];
  const fileType = fileParts.length > 1 ? fileParts[1] : "";
  const parentFolderPath = pathname.substring(0, pathname.lastIndexOf("/"));
  const parentFolderName = parentFolderPath.split("/").pop();

  // Check if the file already exists
  const fileExists = await db.findFileByPath(pathname);
  if (fileExists) {
    res.json({ added: false, fileID: fileExists });
    return;
  }

  try {
    let parentFolder = await db.findFolderByPath(parentFolderPath);

    if (!parentFolder) {
      // We need to create the parentFolder. But first, we may need to create
      // and link any ancestor/descendant folders to this to-be-created
      // folder. E.g., if we already have a/ then if we add a/b/c.txt, we need to
      // link c to be the parent of b.

      // We can't have both mostSimilarAncestor and mostSimilarDescendant as then we'd have
      // the parent folder already created and linked, but this is not the case. So, at least
      // one of the two is null. Hence, we use one function to get this 'most similar' folder.

      const { mostSimilarFolderPath, mostSimilarFolderID, isAncestor } =
        await findMostSimilarFolder(parentFolderPath);

      // Now create the folder
      const newFolderID = uuidv4();
      await db.createFolder({
        folderID: newFolderID,
        parentFolderID: undefined, // We may need to link later
        folderName: parentFolderName,
        folderPath: parentFolderPath,
      });

      parentFolder = newFolderID;

      // Link the parent folder to its most similar ancestor/descendant
      if (mostSimilarFolderID && mostSimilarFolderPath) {
        console.log(
          "linking" +
            mostSimilarFolderPath +
            " to " +
            parentFolderPath +
            " isAncestor: " +
            isAncestor
        );
        if (isAncestor)
          await linkFolders(
            {
              folderID: mostSimilarFolderID,
              folderPath: mostSimilarFolderPath,
            },
            { folderID: newFolderID, folderPath: parentFolderPath }
          );
        else
          await linkFolders(
            { folderID: newFolderID, folderPath: parentFolderPath },
            { folderID: mostSimilarFolderID, folderPath: mostSimilarFolderPath }
          );
      }
    }

    // At this point, we have the parent folder created and linked to its ancestor/descendant if there are any.
    // We can now add the file.

    const fileID = uuidv4();
    await db.addFile({
      fileID: fileID,
      folderID: parentFolder,
      size: size,
      fileName: filename,
      fileType,
      filePath: pathname,
    });

    broadcastMessage({
      action: "addFile",
      folder: parentFolder,
      file: {
        fileID,
        name: filename,
        extension: fileType,
        size,
        modifiedAt: new Date().toISOString(),
      },
    });

    res.json({ added: true, fileID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ added: false });
  }
}
export default router;
