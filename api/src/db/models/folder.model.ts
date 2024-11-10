import prisma from '../prisma.js'
import type { FolderData, FileFolderData, FolderOperations } from '../types.js'

export class FolderModel implements FolderOperations {
  async create(folderData: FolderData): Promise<void> {
    await prisma.folder.create({
      data: {
        folderID: folderData.folderID,
        parentFolderID: folderData.parentFolderID,
        folderName: folderData.folderName,
        folderPath: folderData.folderPath,
        createdAt: folderData.createdAt || new Date()
      }
    })
  }

  async get(folderID: string): Promise<FolderData | null> {
    return await prisma.folder.findUnique({
      where: { folderID }
    })
  }

  async getByPath(folderPath: string): Promise<string | null> {
    const folder = await prisma.folder.findFirst({
      where: { folderPath }
    })
    return folder?.folderID ?? null
  }


  async updateParent(folderID: string, parentFolderID: string): Promise<void> {
    await prisma.folder.update({
      where: { folderID },
      data: { parentFolderID }
    })
  }

  async toggleFavourite(folderID: string): Promise<void> {
    const folder = await prisma.folder.findUnique({
      where: { folderID }
    })

    await prisma.folder.update({
      where: { folderID },
      data: {
        isFavourite: !folder?.isFavourite
      }
    })
  }

  async getName(folderID: string): Promise<string | null> {
    const folder = await prisma.folder.findUnique({
      where: { folderID },
      select: { folderName: true }
    })
    return folder?.folderName ?? null
  }

  async getAll(): Promise<FolderData[]> {
    return await prisma.folder.findMany()
  }

  async getHome(): Promise<FileFolderData[]> {
    const folders = await prisma.folder.findMany({
      where: { parentFolderID: null },
      select: {
        folderID: true,
        folderName: true,
        createdAt: true
      }
    })

    return folders.map(folder => ({
      fileID: folder.folderID,
      name: folder.folderName,
      type: 'folder',
      extension: '',
      size: 0n,
      modifiedAt: folder.createdAt
    }))
  }

  async getContents(folderID: string): Promise<FileFolderData[]> {
    const [files, folders] = await Promise.all([
      prisma.file.findMany({
        where: { folderID },
        select: {
          fileID: true,
          fileName: true,
          fileType: true,
          size: true,
          modifiedAt: true
        }
      }),
      prisma.folder.findMany({
        where: { parentFolderID: folderID },
        select: {
          folderID: true,
          folderName: true,
          createdAt: true
        }
      })
    ])

    return [
      ...files.map(file => ({
        fileID: file.fileID,
        name: file.fileName,
        type: 'file',
        extension: file.fileType,
        size: file.size ?? 0n,
        modifiedAt: file.modifiedAt
      })),
      ...folders.map(folder => ({
        fileID: folder.folderID,
        name: folder.folderName,
        type: 'folder',
        extension: '',
        size: 0n,
        modifiedAt: folder.createdAt
      }))
    ]
  }
}

export const folderModel = new FolderModel()