import express from "express";
import * as orderController from "./order.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateUser, orderController.createOrder);
router.get("/my-orders", authenticateUser, orderController.getMyOrders);
router.patch("/:orderId/status", authenticateUser, orderController.updateStatus);

export default router;