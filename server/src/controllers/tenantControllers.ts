import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid cognitoId parameter." });
      return;
    }

    const tenant = await Prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    res.json(tenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tenant: ${error.message}` });
  }
};
export const createTenant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    if (typeof cognitoId !== "string") {
      res.status(400).json({ message: "Invalid cognitoId parameter." });
      return;
    }

    const tenant = await Prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating tenant: ${error.message}` });
  }
};
export const updateTenant = async (
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

    const updatetenant = await Prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updatetenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating tenant: ${error.message}` });
  }
};
