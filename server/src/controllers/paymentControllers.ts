import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { createNotification } from "./notificationControllers";

const prisma = new PrismaClient();

export const verifyPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reference, applicationId } = req.body;

    if (!reference || !applicationId) {
      res
        .status(400)
        .json({ message: "Reference and applicationId are required." });
      return;
    }

    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      },
    );

    const { status, amount } = paystackResponse.data.data;

    if (status !== "success") {
      res.status(400).json({ message: "Payment verification failed." });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { lease: true, property: true, tenant: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { leaseId: application.leaseId!, paymentStatus: "Paid" },
    });

    if (existingPayment) {
      res
        .status(400)
        .json({ message: "Payment already recorded for this application." });
      return;
    }

    const amountPaidNaira = amount / 100;

    const payment = await prisma.payment.create({
      data: {
        amountDue: application.totalPrice,
        amountPaid: amountPaidNaira,
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentStatus: "Paid",
        leaseId: application.leaseId!,
      },
    });

    // Connect tenant to property (residence) only after payment
    await prisma.property.update({
      where: { id: application.propertyId },
      data: {
        tenants: { connect: { cognitoId: application.tenantCognitoId } },
      },
    });

    // Notify manager of payment
    await createNotification(prisma, {
      userId: application.property.managerCognitoId,
      userType: "manager",
      title: "Payment Received",
      message: `${application.tenant.name} has paid ₦${amountPaidNaira.toLocaleString()} for ${application.property.name}.`,
      type: "payment_received",
      referenceId: application.id,
    });

    // Notify tenant of successful payment
    await createNotification(prisma, {
      userId: application.tenantCognitoId,
      userType: "tenant",
      title: "Payment Successful",
      message: `Your payment of ₦${amountPaidNaira.toLocaleString()} for ${application.property.name} was successful. The property is now your residence!`,
      type: "payment_received",
      referenceId: application.id,
    });

    res.status(201).json({
      message: "Payment verified and recorded successfully.",
      payment,
      reference,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error verifying payment: ${error.message}` });
  }
};

export const getPaymentByApplication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const application = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
    });
    if (!application || !application.leaseId) {
      res.status(404).json({ message: "Application or lease not found." });
      return;
    }
    const payment = await prisma.payment.findFirst({
      where: { leaseId: application.leaseId },
      orderBy: { paymentDate: "desc" },
    });
    res.json(payment ?? null);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error fetching payment: ${error.message}` });
  }
};
