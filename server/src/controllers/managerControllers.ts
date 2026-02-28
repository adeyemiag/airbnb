import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();

export const getManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid cognitoId parameter." });
      return;
    }

    const manager = await Prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (!manager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    res.json(manager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager: ${error.message}` });
  }
};
export const createManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid cognitoId parameter." });
      return;
    }

    const manager = await Prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating manager: ${error.message}` });
  }
};
export const updateManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid cognitoId parameter." });
      return;
    }

    const updateManager = await Prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateManager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating manager: ${error.message}` });
  }
};
