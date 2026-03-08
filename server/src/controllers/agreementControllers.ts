import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createNotification } from "./notificationControllers";

const prisma = new PrismaClient();

export const createAgreement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { applicationId, customTerms } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { property: true, tenant: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

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

    // Notify tenant that agreement was sent
    await createNotification(prisma, {
      userId: application.tenantCognitoId,
      userType: "tenant",
      title: "Agreement Ready to Sign",
      message: `Your rental agreement for ${application.property.name} is ready. Please review and sign it.`,
      type: "agreement_sent",
      referenceId: agreement.id,
    });

    res.status(201).json(agreement);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating agreement: ${error.message}` });
  }
};

export const getAgreements = async (
  req: Request,
  res: Response,
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
          include: { property: { include: { location: true } }, tenant: true },
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

export const getAgreementByApplication = async (
  req: Request,
  res: Response,
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

export const updateAgreementStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const agreement = await prisma.agreement.findUnique({
      where: { id: Number(id) },
      include: { application: { include: { property: true, tenant: true } } },
    });

    if (!agreement) {
      res.status(404).json({ message: "Agreement not found." });
      return;
    }

    const updated = await prisma.agreement.update({
      where: { id: Number(id) },
      data: { status, signedAt: status === "Signed" ? new Date() : null },
      include: { application: { include: { property: true, tenant: true } } },
    });

    // Notify manager when tenant signs or rejects
    const propertyName = agreement.application.property.name;
    const tenantName = agreement.application.tenant.name;

    if (status === "Signed") {
      await createNotification(prisma, {
        userId: agreement.managerCognitoId,
        userType: "manager",
        title: "Agreement Signed",
        message: `${tenantName} has signed the agreement for ${propertyName}. You can now approve their application.`,
        type: "agreement_signed",
        referenceId: agreement.id,
      });
    } else if (status === "Rejected") {
      await createNotification(prisma, {
        userId: agreement.managerCognitoId,
        userType: "manager",
        title: "Agreement Rejected",
        message: `${tenantName} has rejected the agreement for ${propertyName}.`,
        type: "agreement_signed",
        referenceId: agreement.id,
      });
    }

    res.json(updated);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating agreement: ${error.message}` });
  }
};
