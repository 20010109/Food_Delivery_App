import express from "express";
import { authenticateUser } from "../../middleware/auth.js";

import {
  handleCreateRiderProfile,
  handleGetRiderProfile,
  handleUpdateRiderProfile,
  handleUpdateAvailability,
  handleUpdateVerificationStatus,
  handleGetAllRiders,
} from "../controllers/rider.controller.js";

const router = express.Router();

/**
 * =========================
 * RIDER ONBOARDING
 * =========================
 * Called after UserSetup is already done
 */
router.post(
  "/setup",
  authenticateUser,
  handleCreateRiderProfile
);

/**
 * =========================
 * RIDER SELF PROFILE
 * =========================
 */
router.get(
  "/me",
  authenticateUser,
  handleGetRiderProfile
);

router.put(
  "/me",
  authenticateUser,
  handleUpdateRiderProfile
);

/**
 * =========================
 * RIDER AVAILABILITY
 * =========================
 */
router.patch(
  "/availability",
  authenticateUser,
  handleUpdateAvailability
);

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

// Get all riders
router.get(
  "/",
  authenticateUser,
  handleGetAllRiders
);

// Approve / reject rider
router.patch(
  "/verify",
  authenticateUser,
  handleUpdateVerificationStatus
);

export default router;