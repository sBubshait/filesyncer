// Helper functions for adding files
import { v4 as uuidv4 } from "uuid";
import db from "../db/index.js";


export const findMostSimilarFolder = async (folderPath: string) => {
  let mostSimilarFolderPath: string | null = null;
  let mostSimilarFolderID = null;
  let isAncestor = null;

  const allFolders = await db.folder.getAll();
  const folderPathPartsCount = folderPath.split("/").length;
  let maxCommonPathLength = 0;

  allFolders.forEach((folder) => {
    const currentFolderPath = folder.folderPath;
    const currentFolderPathPartsCount = currentFolderPath.split("/").length;

    let commonPathLength = 0;

    if (
      folderPath.startsWith(currentFolderPath) &&
      folderPathPartsCount > currentFolderPathPartsCount
    ) {
      console.log(
        "currentFolderPath: " + currentFolderPath + " folderPath: " + folderPath
      );
      // currentFolderPath is a *true* (not a sibling) ancestor of folderPath
      commonPathLength = currentFolderPath.length;
      // prioritize the closest ancestor if multiple
      if (
        commonPathLength > maxCommonPathLength ||
        (commonPathLength === maxCommonPathLength &&
          mostSimilarFolderPath !== null &&
          currentFolderPathPartsCount > mostSimilarFolderPath.split("/").length)
      ) {
        maxCommonPathLength = commonPathLength;
        mostSimilarFolderPath = currentFolderPath;
        mostSimilarFolderID = folder.folderID;
        isAncestor = true;
      }
    } else if (
      currentFolderPath.startsWith(folderPath) &&
      currentFolderPathPartsCount > folderPathPartsCount
    ) {
      console.log(
        "currentFolderPath: " + currentFolderPath + " folderPath: " + folderPath
      );
      // folderPath is a *true* (not a sibling) ancestor of currentFolderPath
      commonPathLength = folderPath.length;
      if (
        commonPathLength > maxCommonPathLength ||
        (commonPathLength === maxCommonPathLength &&
          mostSimilarFolderPath !== null &&
          currentFolderPathPartsCount < mostSimilarFolderPath.split("/").length)
      ) {
        maxCommonPathLength = commonPathLength;
        mostSimilarFolderPath = currentFolderPath;
        mostSimilarFolderID = folder.folderID;
        isAncestor = false;
      }
    }
  });

  return { mostSimilarFolderPath, mostSimilarFolderID, isAncestor };
};

/**
 * Links two folders together. Creates all intermediate folders if they don't exist and links them appropriately.
 * Precondition: ancestorPath is the closest ancestor of descendantPath in the database or vice versa.
 */
export const linkFolders = async (
  ancestor: { folderID: string; folderPath: string },
  descendant: { folderID: string; folderPath: string }
) => {
  try {
    const { folderID: ancestorID, folderPath: ancestorPath } = ancestor;
    const { folderID: descendantID, folderPath: descendantPath } = descendant;

    const ancestorParts = ancestorPath.split("/");
    const descendantParts = descendantPath.split("/");

    let currentFolderID = ancestorID;
    let currentFolderPath = ancestorPath;

    let pathParts = descendantParts.slice(
      ancestorParts.length,
      descendantParts.length - 1
    );

    for (const part of pathParts) {
      currentFolderPath += `/${part}`;
      // currentFolderPath does not exist in the database as otherwise it would be the most similar folder.

      const newFolderID = uuidv4();
      await db.folder.create({
        folderID: newFolderID,
        parentFolderID: currentFolderID,
        folderName: part,
        folderPath: currentFolderPath,
      });

      currentFolderID = newFolderID;
    }

    // Finally link the descendant to the last created / existing folder.
    await db.folder.updateParent(descendantID, currentFolderID);
  } catch (error) {
    console.error("Error linking folders:", error);
  }
};
