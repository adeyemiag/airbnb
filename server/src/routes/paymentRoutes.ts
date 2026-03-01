import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { verifyPayment, getPaymentByApplication } from "../controllers/paymentControllers";

const router = express.Router();

router.post("/verify", authMiddleware(["tenant"]), verifyPayment);
router.get("/application/:applicationId", authMiddleware(["manager", "tenant"]), getPaymentByApplication);

export default router;
