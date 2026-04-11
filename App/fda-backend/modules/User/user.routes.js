import express from "express";
import { createProfile, getProfile, updateProfile } from "./user.controller.js";

const router = express.Router();
router.post("/profile", createProfile);
router.get("/profile/:id", getProfile);
router.put("/profile/:id", updateProfile);

export default router;