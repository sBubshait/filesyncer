import prisma from "../prisma.js"
import type { FileData, FileFolderData, FileOperations } from '../types.js'

export class FileModel implements FileOperations {
  async create(fileData: FileData): Promise<void> {
    await prisma.file.create({
      data: {
        fileID: fileData.fileID,
        folderID: fileData.folderID,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        filePath: fileData.filePath,
        size: fileData.size,
        createdAt: fileData.createdAt || new Date(),
        modifiedAt: fileData.modifiedAt || new Date()
      }
    })
  }

  async delete(fileID: string): Promise<void> {
    await prisma.file.delete({
      where: { fileID }
    })
  }

  async get(fileID: string): Promise<FileData | null> {
    return await prisma.file.findUnique({
      where: { fileID }
    })
  }

  async getByPath(filePath: string): Promise<string | null> {
    const file = await prisma.file.findFirst({
      where: { filePath }
    })
    return file?.fileID ?? null
  }

  async toggleFavourite(fileID: string): Promise<void> {
    const file = await prisma.file.findUnique({
      where: { fileID }
    })

    await prisma.file.update({
      where: { fileID },
      data: {
        isFavourite: !file?.isFavourite
      }
    })
  }

  async getRecent(): Promise<FileFolderData[]> {
    const files = await prisma.file.findMany({
      select: {
        fileID: true,
        fileName: true,
        fileType: true,
        size: true,
        modifiedAt: true
      },
      orderBy: {
        modifiedAt: 'desc'
      },
      take: 5
    })

    return files.map(file => ({
      fileID: file.fileID,
      name: file.fileName,
      type: 'file',
      extension: file.fileType,
      size: file.size ?? 0n,
      modifiedAt: file.modifiedAt
    }))
  }

  async getFavourites(): Promise<FileFolderData[]> {
    const files = await prisma.file.findMany({
      where: { isFavourite: true },
      select: {
        fileID: true,
        fileName: true,
        fileType: true,
        size: true,
        modifiedAt: true
      }
    })

    return files.map(file => ({
      fileID: file.fileID,
      name: file.fileName,
      type: 'file',
      extension: file.fileType,
      size: file.size ?? 0n,
      modifiedAt: file.modifiedAt
    }))
  }
}

export const fileModel = new FileModel()