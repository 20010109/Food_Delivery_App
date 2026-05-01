import express from "express";
import { authenticate } from "../../../middleware/authMiddleware.js";

import {
  handleCreateRiderProfile,
  handleGetRiderProfile,
  handleUpdateRiderProfile,
  handleUpdateAvailability,
  handleUpdateVerificationStatus,
  handleGetAllRiders,
} from "./rider.controller.js";

const router = express.Router();

/**
 * =========================
 * RIDER ONBOARDING
 * =========================
 * Called after UserSetup is already done
 */
router.post(
  "/setup",
  authenticate,
  handleCreateRiderProfile
);

/**
 * =========================
 * RIDER SELF PROFILE
 * =========================
 */
router.get(
  "/me",
  authenticate,
  handleGetRiderProfile
);

router.put(
  "/me",
  authenticate,
  handleUpdateRiderProfile
);

/**
 * =========================
 * RIDER AVAILABILITY
 * =========================
 */
router.patch(
  "/availability",
  authenticate,
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
  authenticate,
  handleGetAllRiders
);

// Approve / reject rider
router.patch(
  "/verify",
  authenticate,
  handleUpdateVerificationStatus
);

export default router;