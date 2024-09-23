import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const app = express();
app.use(express.json());

app.post('/addFile', async (req: Request, res: Response) => {
  const { pathname } = req.body;

  const fileParts = pathname.substring(pathname.lastIndexOf('/') + 1).split('.');
  const filename = fileParts[0];
  const fileType = fileParts.length > 1 ? fileParts[1] : '';
  const parentFolderPath = pathname.substring(0, pathname.lastIndexOf('/'));
  const parentFolderName = parentFolderPath.split('/').pop();

  // Check if the file already exists
  const fileExists = db.findFileByPath(pathname);
  if (fileExists) {
    res.json({ added: false, fileID: fileExists });
    return;
  }
  
  try {
    let parentFolder = await db.findFolderByPath(parentFolderPath);
    
    if (!parentFolder) {
      const newFolderID = uuidv4();
      await db.createFolder({
        folderID: newFolderID,
        parentFolderID: undefined, // We may need to link later
        folderName: parentFolderName,
        folderPath: parentFolderPath,
      });

      parentFolder = newFolderID;

      // We need to link any ancestor/descendant folders to this newly created
      // folder. E.g., if we already have a/ then if we add a/b/c.txt, we need to
      // link c to be the parent of b.

      // We can't have both mostSimilarAncestor and mostSimilarDescendant as then we'd have 
      // the parent folder already created and linked, but this is not the case. So, at least 
      // one of the two is null. Hence, we use one function to get this 'most similar' folder.

      const { mostSimilarFolderPath, mostSimilarFolderID, isAncestor } = await db.findMostSimilarFolder(parentFolderPath);

      if (isAncestor)
        await linkFolders({mostSimilarFolderID, mostSimilarFolderPath}, {newFolderID, parentFolderPath});
      else
        await linkFolders({newFolderID, parentFolderPath}, {mostSimilarFolderID, mostSimilarFolderPath});
      
    }
    
    // At this point, we have the parent folder created and linked to its ancestor/descendant if there are any.
    // We can now add the file.

    const newFileID = uuidv4();
    await db.addFile({
      fileID: newFileID,
      folderID: parentFolder,
      fileName: filename,
      fileType,
      filePath: pathname,
    });
    
    res.json({ added: true, newFileID });

  } catch (error) {
    console.error(error);
    res.status(500).json({ added: false });
  }
});


const findMostSimilarFolder = async (folderPath: string) => {
  let mostSimilarFolderPath = null;
  let mostSimilarFolderID = null;
  let isAncestor = null;

  let allFolders = await db.getAllFolders();
  let maxCommonPathLength = 0;

  allFolders.forEach(folder => {
    const currentFolderPath = folder.folderPath;
    let commonPathLength = 0;

    if (folderPath.startsWith(currentFolderPath)) {
      // currentFolderPath is an ancestor of folderPath
      commonPathLength = currentFolderPath.length;
      if (commonPathLength > maxCommonPathLength) {
        maxCommonPathLength = commonPathLength;
        mostSimilarFolderPath = currentFolderPath;
        mostSimilarFolderID = folder.folderID;
        isAncestor = true;
      }

    } else if (currentFolderPath.startsWith(folderPath)) {
      // folderPath is an ancestor of currentFolderPath
      commonPathLength = folderPath.length;
      if (commonPathLength > maxCommonPathLength) {
        maxCommonPathLength = commonPathLength;
        mostSimilarFolderPath = currentFolderPath;
        mostSimilarFolderID = folder.folderID;
        isAncestor = false;
      }
    }
  });
  
  return { mostSimilarFolderPath, mostSimilarFolderID, isAncestor };
};

app.post('/deleteFile', (req: Request, res: Response) => {
  const { fileID } = req.body;
  res.json({ deleted: true });
});

app.get('/getFileID', (req: Request, res: Response) => {
  const { pathname } = req.query;
  res.json({ fileID: uuidv4() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
