import express from "express";
import * as menuController from "./menu.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";

const router = express.Router();

const storeownerOnly = [authenticate, roleCheck("storeowner")];

// ===== PUBLIC =====
router.get("/popular", menuController.getPopularMenuItems);
router.get("/public/:restaurantId", menuController.getPublicMenu);

// ===== CRUD (item-specific FIRST) =====
router.put("/:itemId", ...storeownerOnly, menuController.updateItem);
router.delete("/:itemId", ...storeownerOnly, menuController.deleteItem);

// ===== STORE OWNER =====
router.get("/:restaurantId", ...storeownerOnly, menuController.getItems);

// ===== CREATE =====
router.post("/", ...storeownerOnly, menuController.createItem);

export default router;