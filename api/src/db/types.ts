export interface FileData {
  fileID: string;
  folderID: string | null;
  fileName: string;
  fileType: string;
  filePath: string;
  size: bigint | null;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface FolderData {
  folderID: string;
  parentFolderID: string | null;
  folderName: string;
  folderPath: string;
  createdAt?: Date;
}

export interface FileFolderData {
  type: string;
  fileID: string;
  name: string;
  extension: string;
  size?: bigint;
  modifiedAt?: Date;
}

export interface OverviewData {
  fileCount: number;
  favouriteCount: number;
  totalSize: bigint;
}

export interface UserData {
  id: string;
  provider: string;
  apiKey: string;
  createdAt?: Date;
}

export type GeneralOperations = {
  getOverview(): Promise<OverviewData>
  getHomeFiles(): Promise<FileFolderData[]>
  getRecentFiles(): Promise<FileFolderData[]>
  getFavouriteFiles(): Promise<FileFolderData[]>
  search(query: string): Promise<FileFolderData[]>
}

export type FileOperations = {
  create(data: FileData): Promise<void>
  get(id: string): Promise<FileData | null>
  getByPath(path: string): Promise<string | null>
  delete(id: string): Promise<void>
  toggleFavourite(id: string): Promise<void>
}

export type FolderOperations = {
  create(data: FolderData): Promise<void>
  get(id: string): Promise<FolderData | null>
  getByPath(path: string): Promise<string | null>
  updateParent(id: string, parentId: string): Promise<void>
  toggleFavourite(id: string): Promise<void>
  getName(id: string): Promise<string | null>
  getContents(id: string): Promise<FileFolderData[]>
}

export type UserOperations = {
  create(data: UserData): Promise<void>
  get(id: string): Promise<UserData | null>
  getByApiKey(apiKey: string): Promise<UserData | null>
}