import express from "express";
import { createProfile, getProfile, updateProfile, becomeStoreOwner, setupUser, getWallet, addWalletFunds, deductWalletFunds, getGcash, linkGcash, unlinkGcash, getCard, addCard, deleteCard } from "./user.controller.js";
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
router.get("/gcash", authenticate, getGcash);
router.patch("/gcash/link", authenticate, linkGcash);
router.delete("/gcash/unlink", authenticate, unlinkGcash);
router.get("/cards", authenticate, getCard);
router.post("/cards", authenticate, addCard);
router.delete("/cards/:card_id", authenticate, deleteCard);

export default router;