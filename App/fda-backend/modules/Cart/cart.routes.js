import express from "express";
import * as cartController from "./cart.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
const authenticateUser = [authenticate];

// GET cart
router.get("/", ...authenticateUser, cartController.getCart);

// ADD item to cart
router.post("/items", ...authenticateUser, cartController.addItem);

// UPDATE cart item quantity
router.patch("/items/:cartItemId", ...authenticateUser, cartController.updateItem);

// REMOVE item from cart
router.delete("/items/:cartItemId", ...authenticateUser, cartController.removeItem);

// CLEAR entire cart
router.delete("/", ...authenticateUser, cartController.clearEntireCart);

// CLEAR cart by restaurant
router.delete("/restaurant/:restaurantId", ...authenticateUser, cartController.clearRestaurantCart);

export default router;
