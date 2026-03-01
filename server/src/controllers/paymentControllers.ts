import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// Verify Paystack transaction and record payment
export const verifyPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reference, applicationId } = req.body;

    if (!reference || !applicationId) {
      res.status(400).json({ message: "Reference and applicationId are required." });
      return;
    }

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, amount, customer } = paystackResponse.data.data;

    if (status !== "success") {
      res.status(400).json({ message: "Payment verification failed." });
      return;
    }

    // Get the application
    const application = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { lease: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    // Check not already paid
    const existingPayment = await prisma.payment.findFirst({
      where: {
        leaseId: application.leaseId!,
        paymentStatus: "Paid",
      },
    });

    if (existingPayment) {
      res.status(400).json({ message: "Payment already recorded for this application." });
      return;
    }

    // Paystack amount is in kobo (smallest unit), convert to naira
    const amountPaidNaira = amount / 100;

    // Record payment
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

// Get payment status for an application
export const getPaymentByApplication = async (
  req: Request,
  res: Response
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
