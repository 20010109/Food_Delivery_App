import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getStoreOrders,
  updateStoreOrderStatus,
  getStoreStats,
} from "./order.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";

const router = express.Router();

const storeownerOnly = [authenticate, roleCheck("storeowner")];

router.post("/order", authenticate, createOrder);
router.get("/orders", authenticate, getOrders);
router.get("/order/:id", authenticate, getOrderById);
router.put("/order/:id/status", authenticate, updateOrderStatus);
router.delete("/order/:id", authenticate, cancelOrder);

// storeowner routes
router.get("/storeowner/:restaurant_id/orders", ...storeownerOnly, getStoreOrders);
router.patch("/storeowner/:restaurant_id/orders/:order_id/status", ...storeownerOnly, updateStoreOrderStatus);
router.get("/storeowner/:restaurant_id/stats", ...storeownerOnly, getStoreStats);

export default router;