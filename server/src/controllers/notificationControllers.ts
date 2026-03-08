import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: String(userId),
        userType: String(userType),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: `Error fetching notifications: ${error.message}` });
  }
};

export const markAllRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.body;

    await prisma.notification.updateMany({
      where: { userId: String(userId), userType: String(userType), isRead: false },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read." });
  } catch (error: any) {
    res.status(500).json({ message: `Error marking notifications: ${error.message}` });
  }
};

export const markOneRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: `Error marking notification: ${error.message}` });
  }
};

// Helper used internally by other controllers
export async function createNotification(
  prismaClient: any,
  data: {
    userId: string;
    userType: string;
    title: string;
    message: string;
    type: string;
    referenceId?: number;
  }
) {
  return prismaClient.notification.create({ data });
}
