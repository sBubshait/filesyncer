export interface FileData {
  fileID: string;
  folderID: string;
  fileName: string;
  fileType: string;
  filePath: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
}

export interface FolderData {
  folderID: string;
  parentFolderID?: string;
  folderName: string;
  folderPath: string;
  createdAt?: string;
}

export interface FileFolderData {
  fileID: string;
  type: string;
  name: string;
  extension: string;
  size?: number;
  modifiedAt?: string;
}
