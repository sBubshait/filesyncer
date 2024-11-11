import prisma from "../prisma.js";
import type { UserData, UserOperations } from "../types.js";

export class UserModel implements UserOperations {
  async create(userData: UserData): Promise<void> {
    await prisma.user.create({
      data: {
        id: userData.id,
        provider: userData.provider,
        apiKey: userData.apiKey,
      },
    });
  }

  async get(id: string): Promise<UserData | null> {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getByApiKey(apiKey: string): Promise<UserData | null> {
    return await prisma.user.findUnique({
      where: {
        apiKey,
      },
    });
  }
}

export const userModel = new UserModel();