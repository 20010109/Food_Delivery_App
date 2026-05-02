import express from "express";
import { createProfile, getProfile, updateProfile, becomeStoreOwner, setupUser, getWallet, addWalletFunds, deductWalletFunds } from "./user.controller.js";
import { authenticate } from "../../../middleware/authMiddleware.js";

const router = express.Router();
router.post("/setup", authenticate, setupUser);
router.post("/profile", authenticate, createProfile);
router.get("/profile/:id", authenticate, getProfile);
router.put("/profile/:id", authenticate, updateProfile);
router.put("/become-storeowner", authenticate, becomeStoreOwner);
router.get("/wallet", authenticate, getWallet);
router.patch("/wallet/add", authenticate, addWalletFunds);
router.patch("/wallet/deduct", authenticate, deductWalletFunds);

export default router;