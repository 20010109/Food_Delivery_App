import express from "express";
import { createProfile, getProfile, updateProfile } from "./user.controller.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/profile", authenticate, createProfile);
router.get("/profile/:id", authenticate, getProfile);
router.put("/profile/:id", authenticate, updateProfile);

export default router;