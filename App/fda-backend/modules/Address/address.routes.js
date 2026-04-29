import express from "express";
import {
  createUserAddress,
  getUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from "./address.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Create new address
router.post("/", authenticate, createUserAddress);

// Get all user addresses
router.get("/", authenticate, getUserAddress);

// Update address by ID
router.put("/:id", authenticate, updateUserAddress);

// Delete address by ID
router.delete("/:id", authenticate, deleteUserAddress);

// Change is_default
router.patch("/:id/default", authenticate, setDefaultAddress);

export default router;