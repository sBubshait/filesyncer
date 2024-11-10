import prisma from "../prisma.js";
import type { File, Folder } from "@prisma/client";
import type {
  FileFolderData,
  GeneralOperations,
  OverviewData,
} from "../types.js";

type FileResult = Pick<
  File,
  "fileID" | "fileName" | "fileType" | "size" | "modifiedAt"
>;
type FolderResult = Pick<Folder, "folderID" | "folderName" | "createdAt">;

export class GeneralModel implements GeneralOperations {
  async getOverview(): Promise<OverviewData> {
    const [fileCount, favouriteFiles, favouriteFolders, totalSize] =
      await Promise.all([
        prisma.file.count(),
        prisma.file.count({
          where: { isFavourite: true },
        }),
        prisma.folder.count({
          where: { isFavourite: true },
        }),
        prisma.file.aggregate({
          _sum: {
            size: true,
          },
        }),
      ]);

    return {
      fileCount,
      favouriteCount: favouriteFiles + favouriteFolders,
      totalSize: totalSize._sum.size || BigInt(0),
    };
  }

  async getHomeFiles(): Promise<FileFolderData[]> {
    const [files, folders] = await Promise.all([
      prisma.file.findMany({
        where: { folderID: null },
        select: {
          fileID: true,
          fileName: true,
          fileType: true,
          size: true,
          modifiedAt: true,
        },
      }),
      prisma.folder.findMany({
        where: { parentFolderID: null },
        select: {
          folderID: true,
          folderName: true,
          createdAt: true,
        },
      }),
    ]);

    return [
      ...files.map((file: FileResult) => ({
        fileID: file.fileID,
        name: file.fileName,
        type: "file" as const,
        extension: file.fileType,
        size: file.size || 0n,
        modifiedAt: file.modifiedAt,
      })),
      ...folders.map((folder: FolderResult) => ({
        fileID: folder.folderID,
        name: folder.folderName,
        type: "folder" as const,
        extension: "",
        size: 0n,
        modifiedAt: folder.createdAt,
      })),
    ];
  }

  async getRecentFiles(): Promise<FileFolderData[]> {
    const files = await prisma.file.findMany({
      select: {
        fileID: true,
        fileName: true,
        fileType: true,
        size: true,
        modifiedAt: true,
      },
      orderBy: {
        modifiedAt: "desc",
      },
      take: 5,
    });

    return files.map((file: FileResult) => ({
      fileID: file.fileID,
      name: file.fileName,
      type: "file" as const,
      extension: file.fileType,
      size: file.size || 0n,
      modifiedAt: file.modifiedAt,
    }));
  }

  async getFavouriteFiles(): Promise<FileFolderData[]> {
    const [files, folders] = await Promise.all([
      prisma.file.findMany({
        where: { isFavourite: true },
        select: {
          fileID: true,
          fileName: true,
          fileType: true,
          size: true,
          modifiedAt: true,
        },
      }),
      prisma.folder.findMany({
        where: { isFavourite: true },
        select: {
          folderID: true,
          folderName: true,
          createdAt: true,
        },
      }),
    ]);

    return [
      ...files.map((file: FileResult) => ({
        fileID: file.fileID,
        name: file.fileName,
        type: "file" as const,
        extension: file.fileType,
        size: file.size || 0n,
        modifiedAt: file.modifiedAt,
      })),
      ...folders.map((folder: FolderResult) => ({
        fileID: folder.folderID,
        name: folder.folderName,
        type: "folder" as const,
        extension: "",
        size: 0n,
        modifiedAt: folder.createdAt,
      })),
    ];
  }

  async search(query: string): Promise<FileFolderData[]> {
    if (!query.trim()) {
      return []
    }

    const [files, folders] = await Promise.all([
      prisma.file.findMany({
        where: {
          OR: [
            { fileName: { contains: query } },
            { fileType: { contains: query } }
          ]
        },
        select: {
          fileID: true,
          fileName: true,
          fileType: true,
          size: true,
          modifiedAt: true
        }
      }),
      prisma.folder.findMany({
        where: {
          folderName: { contains: query }
        },
        select: {
          folderID: true,
          folderName: true,
          createdAt: true
        }
      })
    ])

    return [
      ...files.map((file: FileResult) => ({
        fileID: file.fileID,
        name: file.fileName,
        type: 'file',
        extension: file.fileType,
        size: file.size || BigInt(0),
        modifiedAt: file.modifiedAt
      })),
      ...folders.map((folder: FolderResult) => ({
        fileID: folder.folderID,
        name: folder.folderName,
        type: 'folder',
        extension: '',
        size: BigInt(0),
        modifiedAt: folder.createdAt
      }))
    ]
  }
}

export const generalModel = new GeneralModel();
