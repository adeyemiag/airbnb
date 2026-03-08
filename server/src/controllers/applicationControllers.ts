import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createNotification } from "./notificationControllers";

const prisma = new PrismaClient();

function calculateTotalPrice(
  pricePerMonth: number,
  startDate: Date,
  endDate: Date,
): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const dailyRate = pricePerMonth / 30;
  let discount = 0;
  if (days >= 30) discount = 0.1;
  else if (days >= 7) discount = 0.05;
  return Math.round(dailyRate * days * (1 - discount) * 100) / 100;
}

export const listApplications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, userType } = req.query;
    let whereClause = {};
    if (userId && userType) {
      if (userType === "tenant")
        whereClause = { tenantCognitoId: String(userId) };
      else if (userType === "manager")
        whereClause = { property: { managerCognitoId: String(userId) } };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        property: { include: { location: true, manager: true } },
        tenant: true,
      },
    });

    function calculateNextPaymentDate(startDate: Date): Date {
      const today = new Date();
      const nextPaymentDate = new Date(startDate);
      while (nextPaymentDate <= today)
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      return nextPaymentDate;
    }

    const formattedApplications = await Promise.all(
      applications.map(async (app) => {
        const lease = await prisma.lease.findFirst({
          where: {
            tenant: { cognitoId: app.tenantCognitoId },
            propertyId: app.propertyId,
          },
          orderBy: { startDate: "desc" },
        });
        return {
          ...app,
          property: { ...app.property, address: app.property.location.address },
          manager: app.property.manager,
          lease: lease
            ? {
                ...lease,
                nextPaymentDate: calculateNextPaymentDate(lease.startDate),
              }
            : null,
        };
      }),
    );

    res.json(formattedApplications);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving applications: ${error.message}` });
  }
};

export const createApplication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      applicationDate,
      status,
      propertyId,
      tenantCognitoId,
      name,
      email,
      phoneNumber,
      message,
      startDate,
      endDate,
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid start or end date." });
      return;
    }

    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 2) {
      res.status(400).json({ message: "Stay must be at least 2 days." });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        pricePerMonth: true,
        securityDeposit: true,
        name: true,
        managerCognitoId: true,
      },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const totalPrice = calculateTotalPrice(property.pricePerMonth, start, end);

    const newApplication = await prisma.$transaction(async (prisma) => {
      const lease = await prisma.lease.create({
        data: {
          startDate: start,
          endDate: end,
          rent: property.pricePerMonth,
          deposit: property.securityDeposit,
          property: { connect: { id: propertyId } },
          tenant: { connect: { cognitoId: tenantCognitoId } },
        },
      });

      const application = await prisma.application.create({
        data: {
          applicationDate: new Date(applicationDate),
          status,
          name,
          email,
          phoneNumber,
          message,
          startDate: start,
          endDate: end,
          totalPrice,
          property: { connect: { id: propertyId } },
          tenant: { connect: { cognitoId: tenantCognitoId } },
          lease: { connect: { id: lease.id } },
        },
        include: { property: true, tenant: true, lease: true },
      });

      // Notify manager of new application
      await createNotification(prisma, {
        userId: property.managerCognitoId,
        userType: "manager",
        title: "New Application Received",
        message: `${name} has applied for ${property.name}.`,
        type: "application_status",
        referenceId: application.id,
      });

      return application;
    });

    res.status(201).json(newApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating application: ${error.message}` });
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: { property: true, tenant: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    if (status === "Approved") {
      const newLease = await prisma.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ),
          rent: application.property.pricePerMonth,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        },
      });

      await prisma.property.update({
        where: { id: application.propertyId },
        data: {
          tenants: { connect: { cognitoId: application.tenantCognitoId } },
        },
      });

      await prisma.application.update({
        where: { id: Number(id) },
        data: { status, leaseId: newLease.id },
      });
    } else {
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status },
      });
    }

    // Notify tenant of status change
    await createNotification(prisma, {
      userId: application.tenantCognitoId,
      userType: "tenant",
      title: `Application ${status}`,
      message: `Your application for ${application.property.name} has been ${status.toLowerCase()}.`,
      type: "application_status",
      referenceId: application.id,
    });

    const updatedApplication = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: { property: true, tenant: true, lease: true },
    });

    res.json(updatedApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating application status: ${error.message}` });
  }
};
