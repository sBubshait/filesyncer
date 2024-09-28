import mysql, { RowDataPacket } from "mysql2/promise";
import { FileData, FolderData, FileFolderData } from "./types.js";
import * as dotenv from "dotenv";
dotenv.config();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Overview Operation
export async function getOverview(): Promise<{ files: number; favourites: number; storageUsed: number }> {
  const query = `
    SELECT COUNT(*) as files FROM files;
    SELECT COUNT(*) as favouritesFiles FROM files WHERE isFavourite = 1;
    SELECT COUNT(*) as favouritesFolders FROM folders WHERE isFavourite = 1;
    SELECT COALESCE(SUM(size), 0) as storageUsed FROM files;
  `;
  const [results] = await pool.query<RowDataPacket[]>(query);
  const files = results[0][0].files as number;
  const favourites = results[1][0].favouritesFiles + results[2][0].favouritesFolders;
  const storageUsed = results[3][0].storageUsed as number;
  return { files, favourites, storageUsed };
}

// File Operations
export async function findFileByPath(filePath: string): Promise<string | null> {
  const query = "SELECT * FROM files WHERE filePath = ?";
  const [rows] = await pool.execute<RowDataPacket[]>(query, [filePath]);
  const files = rows as FileData[];
  return files.length > 0 ? files[0].fileID : null;
}

export async function addFile(fileData: FileData): Promise<void> {
  const query = `
    INSERT INTO files (fileID, folderID, fileName, fileType, filePath, size, createdAt, modifiedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const { fileID, folderID, fileName, fileType, filePath, size, createdAt, modifiedAt } = fileData;
  await pool.execute(query, [
    fileID,
    folderID,
    fileName,
    fileType,
    filePath,
    size || null,
    createdAt || new Date(),
    modifiedAt || new Date(),
  ]);
}

export async function deleteFile(fileID: string): Promise<void> {
  const query = "DELETE FROM files WHERE fileID = ?";
  await pool.execute(query, [fileID]);
}

export async function getFile(fileID: string): Promise<FileData | null> {
  const query = "SELECT * FROM files WHERE fileID = ?";
  const [rows] = await pool.execute<RowDataPacket[]>(query, [fileID]);
  const files = rows as FileData[];
  return files.length > 0 ? files[0] : null;
}

export async function toggleFavouriteFile(fileID: string): Promise<void> {
  const query = "UPDATE files SET isFavourite = !isFavourite WHERE fileID = ?";
  await pool.execute(query, [fileID]);
}

export async function getRecentFiles(): Promise<FileFolderData[]> {
  const query = "SELECT fileID, fileName as name, 'file' as type, fileType as extension, size, modifiedAt FROM files ORDER BY modifiedAt DESC LIMIT 5";
  const [rows] = await pool.execute<RowDataPacket[]>(query);
  return rows as FileFolderData[];
}

export async function getFavouriteFiles(): Promise<FileFolderData[]> {
  const query = `
    SELECT fileID, fileName as name, 'file' as type, fileType as extension, size, modifiedAt FROM files WHERE isFavourite = 1
    UNION
    SELECT folderID as fileID, folderName as name, 'folder' as type, '' as extension, 0 as size, createdAt as modifiedAt FROM folders WHERE isFavourite = 1
  `;
  const [rows] = await pool.execute<RowDataPacket[]>(query);
  return rows as FileFolderData[];
}

// Folder Operations
export async function findFolderByPath(folderPath: string): Promise<string | null> {
  const query = "SELECT * FROM folders WHERE folderPath = ?";
  const [rows] = await pool.execute<RowDataPacket[]>(query, [folderPath]);
  const folders = rows as FolderData[];
  return folders.length > 0 ? folders[0].folderID : null;
}

export async function createFolder(folderData: FolderData): Promise<void> {
  const query = `
    INSERT INTO folders (folderID, parentFolderID, folderName, folderPath, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `;
  const { folderID, parentFolderID, folderName, folderPath, createdAt } = folderData;
  await pool.execute(query, [
    folderID,
    parentFolderID || null,
    folderName,
    folderPath,
    createdAt || new Date(),
  ]);
}

export async function updateFolderParent(folderID: string, parentFolderID: string): Promise<void> {
  const query = "UPDATE folders SET parentFolderID = ? WHERE folderID = ?";
  await pool.execute(query, [parentFolderID, folderID]);
}

export async function getFolder(folderID: string): Promise<FolderData | null> {
  const query = "SELECT * FROM folders WHERE folderID = ?";
  const [rows] = await pool.execute<RowDataPacket[]>(query, [folderID]);
  const folders = rows as FolderData[];
  return folders.length > 0 ? folders[0] : null;
}

export async function toggleFavouriteFolder(folderID: string): Promise<void> {
  const query = "UPDATE folders SET isFavourite = !isFavourite WHERE folderID = ?";
  await pool.execute(query, [folderID]);
}

export async function getFolderName(folderID: string): Promise<string | null> {
  const query = "SELECT folderName FROM folders WHERE folderID = ?";
  const [rows] = await pool.execute<RowDataPacket[]>(query, [folderID]);
  const folders = rows as FolderData[];
  return folders.length > 0 ? folders[0].folderName : null;
}

export async function getAllFolders(): Promise<FolderData[]> {
  const query = "SELECT * FROM folders";
  const [rows] = await pool.execute<RowDataPacket[]>(query);
  return rows as FolderData[];
}

export async function getHomeFolders(): Promise<FileFolderData[]> {
  const query = "SELECT folderID as fileID, folderName as name, 'folder' as type, '' as extension, 0 as size, createdAt as modifiedAt FROM folders WHERE parentFolderID IS NULL";
  const [rows] = await pool.execute<RowDataPacket[]>(query);
  return rows as FileFolderData[];
}

export async function getFolderFiles(folderID: string): Promise<FileFolderData[]> {
  const query = `
    SELECT fileID, fileName as name, 'file' as type, fileType as extension, size, modifiedAt FROM files WHERE folderID = ?
    UNION
    SELECT folderID as fileID, folderName as name, 'folder' as type, '' as extension, 0 as size, createdAt as modifiedAt FROM folders WHERE parentFolderID = ?
  `;
  const [rows] = await pool.execute<RowDataPacket[]>(query, [folderID, folderID]);
  return rows as FileFolderData[];
}

// Search Operation
export async function searchFiles(query: string): Promise<FileFolderData[]> {
  const searchQuery = `%${query}%`;
  const queryStr = `
    SELECT fileID, fileName as name, 'file' as type, fileType as extension, size, modifiedAt FROM files WHERE fileName LIKE ?
    UNION
    SELECT folderID as fileID, folderName as name, 'folder' as type, '' as extension, 0 as size, createdAt as modifiedAt FROM folders WHERE folderName LIKE ?
  `;
  const [rows] = await pool.execute<RowDataPacket[]>(queryStr, [searchQuery, searchQuery]);
  return rows as FileFolderData[];
}

// Export as Default Object
export default {
  getOverview,
  findFileByPath,
  addFile,
  deleteFile,
  getFile,
  toggleFavouriteFile,
  getRecentFiles,
  getFavouriteFiles,
  findFolderByPath,
  createFolder,
  updateFolderParent,
  getFolder,
  toggleFavouriteFolder,
  getFolderName,
  getAllFolders,
  getHomeFolders,
  getFolderFiles,
  searchFiles,
};
