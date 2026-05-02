import express from "express";
import { authenticate } from "../../../middleware/authMiddleware.js";
import { roleCheck } from "../../../middleware/roleCheck.js";

import {
  handleCreateRiderProfile,
  handleGetRiderProfile,
  handleUpdateRiderProfile,
  handleUpdateAvailability,
  handleUpdateVerificationStatus,
  handleGetAllRiders,
  handleGetAvailableOrders,
  handleClaimDelivery,
  handleGetActiveDelivery,
  handleGetDeliveryHistory,
  handleUpdateDeliveryStatus,
} from "./rider.controller.js";

const router = express.Router();
const riderOnly = [authenticate, roleCheck("rider")];
const adminOnly = [authenticate, roleCheck("admin")];

// Onboarding (any authenticated user)
router.post("/setup", authenticate, handleCreateRiderProfile);

// Self profile
router.get("/me", authenticate, handleGetRiderProfile);
router.put("/me", authenticate, handleUpdateRiderProfile);
router.patch("/availability", ...riderOnly, handleUpdateAvailability);

// Delivery operations
router.get("/pool", ...riderOnly, handleGetAvailableOrders);
router.post("/claim", ...riderOnly, handleClaimDelivery);
router.get("/active", ...riderOnly, handleGetActiveDelivery);
router.get("/history", ...riderOnly, handleGetDeliveryHistory);
router.put("/status", ...riderOnly, handleUpdateDeliveryStatus);

// Admin
router.get("/", ...adminOnly, handleGetAllRiders);
router.patch("/verify", ...adminOnly, handleUpdateVerificationStatus);

export default router;