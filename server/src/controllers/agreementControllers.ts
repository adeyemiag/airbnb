import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manager sends an agreement for a specific application
export const createAgreement = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { applicationId, customTerms } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { property: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    // Only one agreement per application
    const existing = await prisma.agreement.findUnique({
      where: { applicationId: Number(applicationId) },
    });

    if (existing) {
      res
        .status(400)
        .json({ message: "An agreement already exists for this application." });
      return;
    }

    const agreement = await prisma.agreement.create({
      data: {
        applicationId: Number(applicationId),
        managerCognitoId: application.property.managerCognitoId,
        tenantCognitoId: application.tenantCognitoId,
        propertyId: application.propertyId,
        customTerms: customTerms || null,
        status: "Pending",
      },
      include: { application: { include: { property: true, tenant: true } } },
    });

    res.status(201).json(agreement);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating agreement: ${error.message}` });
  }
};

// Get agreements — filtered by userId + userType
export const getAgreements = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    const whereClause =
      userType === "manager"
        ? { managerCognitoId: String(userId) }
        : { tenantCognitoId: String(userId) };

    const agreements = await prisma.agreement.findMany({
      where: whereClause,
      include: {
        application: {
          include: {
            property: { include: { location: true } },
            tenant: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
    });

    res.json(agreements);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error fetching agreements: ${error.message}` });
  }
};

// Get single agreement by applicationId
export const getAgreementByApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { applicationId } = req.params;

    const agreement = await prisma.agreement.findUnique({
      where: { applicationId: Number(applicationId) },
      include: {
        application: {
          include: {
            property: { include: { location: true, manager: true } },
            tenant: true,
          },
        },
      },
    });

    if (!agreement) {
      res.status(404).json({ message: "No agreement found." });
      return;
    }

    res.json(agreement);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error fetching agreement: ${error.message}` });
  }
};

// Tenant signs or rejects the agreement
export const updateAgreementStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Signed" or "Rejected"

    const agreement = await prisma.agreement.findUnique({
      where: { id: Number(id) },
    });

    if (!agreement) {
      res.status(404).json({ message: "Agreement not found." });
      return;
    }

    const updated = await prisma.agreement.update({
      where: { id: Number(id) },
      data: {
        status,
        signedAt: status === "Signed" ? new Date() : null,
      },
      include: {
        application: { include: { property: true, tenant: true } },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating agreement: ${error.message}` });
  }
};
