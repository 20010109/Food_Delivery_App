import express from "express";
import { createProfile } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/profile", authenticate, createProfile);

export default router;