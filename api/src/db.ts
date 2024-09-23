import mysql, { RowDataPacket } from "mysql2/promise";
import * as dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


interface FileData {
  fileID: string;
  folderID: string;
  fileName: string;
  fileType: string;
  filePath: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
}

interface FolderData {
  folderID: string;
  parentFolderID?: string;
  folderName: string;
  folderPath: string;
  createdAt?: string;
}

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

  const {
    fileID,
    folderID,
    fileName,
    fileType,
    filePath,
    size,
    createdAt,
    modifiedAt,
  } = fileData;

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

export async function removeFile(filePath: string): Promise<void> {
  const query = "DELETE FROM files WHERE filePath = ?";
  await pool.execute(query, [filePath]);
}

export async function findFolderByPath(folderPath: string): Promise<string | null> {
  const query = "SELECT * FROM folders WHERE folderPath = ?";
  const [rows] = await pool.execute<RowDataPacket[]>(query, [folderPath]);

  const folders = rows as FolderData[];
  return folders.length > 0 ? folders[0].folderID : null;
};

export async function getAllFolders(): Promise<FolderData[]> {
  const query = "SELECT * FROM folders";
  const [rows] = await pool.execute<RowDataPacket[]>(query);

  return rows as FolderData[];
};

export async function getHomeFolders(): Promise<FolderData[]> {
  const query = "SELECT * FROM folders WHERE parentFolderID IS NULL";
  const [rows] = await pool.execute<RowDataPacket[]>(query);

  return rows as FolderData[];
}

export async function createFolder(folderData: FolderData): Promise<void> {
  const query = `
    INSERT INTO folders (folderID, parentFolderID, folderName, folderPath, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `;

  const {
    folderID,
    parentFolderID,
    folderName,
    folderPath,
    createdAt,
  } = folderData;

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

export default {
  findFileByPath,
  addFile,
  removeFile,
  getAllFolders,
  findFolderByPath,
  getHomeFolders,
  createFolder,
  updateFolderParent
};