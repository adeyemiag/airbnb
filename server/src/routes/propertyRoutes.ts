import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers";
import { getPropertyLeases } from "../controllers/leaseControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.get(
  "/:id/leases",
  authMiddleware(["manager", "tenant"]),
  getPropertyLeases,
);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty,
);

export default router;
