import express from "express";
import * as menuController from "./menu.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";

const router = express.Router();

const storeownerOnly = [authenticate, roleCheck("storeowner")];

// CREATE
router.post("/", ...storeownerOnly, menuController.createItem);

// GET OWN MENU
router.get("/:restaurantId", ...storeownerOnly, menuController.getItems);

// PUBLIC
router.get("/public/:restaurantId", menuController.getPublicMenu);

// UPDATE
router.put("/:itemId", ...storeownerOnly, menuController.updateItem);

// DELETE
router.delete("/:itemId", ...storeownerOnly, menuController.deleteItem);

export default router;