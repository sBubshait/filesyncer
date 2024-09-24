import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const app = express();
app.use(express.json());

app.post('/addFile', async (req: Request, res: Response) => {
  const { pathname, size } = req.body;

  if (!pathname) {
    res.status(400).json({ added: false });
    return;
  }

  const fileParts = pathname.substring(pathname.lastIndexOf('/') + 1).split('.');
  const filename = fileParts[0];
  const fileType = fileParts.length > 1 ? fileParts[1] : '';
  const parentFolderPath = pathname.substring(0, pathname.lastIndexOf('/'));
  const parentFolderName = parentFolderPath.split('/').pop();

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

      const { mostSimilarFolderPath, mostSimilarFolderID, isAncestor } = await findMostSimilarFolder(parentFolderPath);

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
        console.log("linking" + mostSimilarFolderPath + " to " + parentFolderPath + " isAncestor: " + isAncestor);
        if (isAncestor)
          await linkFolders({folderID: mostSimilarFolderID, folderPath: mostSimilarFolderPath}, {folderID: newFolderID, folderPath: parentFolderPath});
        else
          await linkFolders({folderID: newFolderID, folderPath: parentFolderPath}, {folderID: mostSimilarFolderID, folderPath: mostSimilarFolderPath});
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
    
    res.json({ added: true, fileID });

  } catch (error) {
    console.error(error);
    res.status(500).json({ added: false });
  }
});

const findMostSimilarFolder = async (folderPath: string) => {
  let mostSimilarFolderPath: string | null = null;
  let mostSimilarFolderID = null;
  let isAncestor = null;

  const allFolders = await db.getAllFolders();
  const folderPathPartsCount = folderPath.split('/').length;
  let maxCommonPathLength = 0;

  allFolders.forEach(folder => {
    const currentFolderPath = folder.folderPath;
    const currentFolderPathPartsCount = currentFolderPath.split('/').length;

    let commonPathLength = 0;

    if (folderPath.startsWith(currentFolderPath) && folderPathPartsCount > currentFolderPathPartsCount) {
      console.log("currentFolderPath: " + currentFolderPath + " folderPath: " + folderPath);
      // currentFolderPath is a *true* (not a sibling) ancestor of folderPath
      commonPathLength = currentFolderPath.length;
      // prioritize the closest ancestor if multiple
      if (
        commonPathLength > maxCommonPathLength ||
        (commonPathLength === maxCommonPathLength && mostSimilarFolderPath !== null && currentFolderPathPartsCount > mostSimilarFolderPath.split('/').length)
      ) {
        maxCommonPathLength = commonPathLength;
        mostSimilarFolderPath = currentFolderPath;
        mostSimilarFolderID = folder.folderID;
        isAncestor = true;
      }

    } else if (currentFolderPath.startsWith(folderPath) && currentFolderPathPartsCount > folderPathPartsCount) {
      console.log("currentFolderPath: " + currentFolderPath + " folderPath: " + folderPath);
      // folderPath is a *true* (not a sibling) ancestor of currentFolderPath
      commonPathLength = folderPath.length;
      if (
        commonPathLength > maxCommonPathLength ||
        (commonPathLength === maxCommonPathLength && mostSimilarFolderPath !== null && currentFolderPathPartsCount < mostSimilarFolderPath.split('/').length)
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
const linkFolders = async (ancestor: {folderID: string, folderPath: string}, descendant: {folderID: string, folderPath: string}) => {
  try {
    const { folderID: ancestorID, folderPath: ancestorPath } = ancestor;
    const { folderID: descendantID, folderPath: descendantPath } = descendant;

    const ancestorParts = ancestorPath.split('/');
    const descendantParts = descendantPath.split('/');

    let currentFolderID = ancestorID;
    let currentFolderPath = ancestorPath;

    let pathParts = descendantParts.slice(ancestorParts.length, descendantParts.length - 1);

    for (const part of pathParts) {
      currentFolderPath += `/${part}`;
      // currentFolderPath does not exist in the database as otherwise it would be the most similar folder. 

      const newFolderID = uuidv4();
      await db.createFolder({
        folderID: newFolderID,
        parentFolderID: currentFolderID,
        folderName: part,
        folderPath: currentFolderPath,
      });

      currentFolderID = newFolderID;
    }

    // Finally link the descendant to the last created / existing folder.
    await db.updateFolderParent(descendantID, currentFolderID);

  } catch (error) {
    console.error('Error linking folders:', error);  
  }
};

app.get('/getFileID', async (req: Request, res: Response) => {
  const { pathname } = req.query;
  const fileID = await db.findFileByPath(pathname as string);
  res.json({ fileID });
});

app.post('/deleteFile', async (req: Request, res: Response) => {
  const { fileID } = req.body;
  try {
    await db.deleteFile(fileID);
    res.json({ deleted: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ deleted: false });
  }
});

app.get('/getSection/home', async (req: Request, res: Response) => {
  try {
    // Find all folders with no parent
    const homeFolders = await db.getHomeFolders();
    res.json(homeFolders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  }
});

app.get('/getSection/recent', async (req: Request, res: Response) => {
  try {
    const section = await db.getRecentFiles();
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  }
});

app.get('/getSection/favourites', async (req: Request, res: Response) => {
  try {
    const section = await db.getFavouriteFiles();
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  }
});

app.get('/getFolder/:folderID', async (req: Request, res: Response) => {
  const { folderID } = req.params;
  try {
    const folder = await db.getFolderName(folderID);
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }
    const files = await db.getFolderFiles(folderID);
    res.json({ name: folder, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true });
  }
});

app.get('/search', async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
