import express from "express";
import { createProfile, getProfile, updateProfile, becomeStoreOwner } from "./user.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();
router.post("/profile", authenticate, createProfile);
router.get("/profile/:id", authenticate, getProfile);
router.put("/profile/:id", authenticate, updateProfile);
router.put("/become-storeowner", authenticate, becomeStoreOwner);

export default router;