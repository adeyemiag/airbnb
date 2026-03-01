import express from "express";
import {
  createAgreement,
  getAgreements,
  getAgreementByApplication,
  updateAgreementStatus,
} from "../controllers/agreementControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getAgreements);
router.post("/", authMiddleware(["manager"]), createAgreement);
router.get(
  "/application/:applicationId",
  authMiddleware(["manager", "tenant"]),
  getAgreementByApplication
);
router.put(
  "/:id/status",
  authMiddleware(["manager", "tenant"]),
  updateAgreementStatus
);

export default router;
