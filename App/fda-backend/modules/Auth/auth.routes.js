import express from "express";
import { createProfile, signup, login } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/profile", authenticate, createProfile);
router.post("/signup", signup);
router.post("/login", login);

export default router;