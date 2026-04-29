import express from "express";
import * as controller from "./restaurant.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";

const router = express.Router();

const storeownerOnly = [authenticate, roleCheck("storeowner")];
const adminOnly = [authenticate, roleCheck("admin")];

// ADMIN (PUT THIS FIRST)
router.get("/admin", ...adminOnly, controller.getAllRestaurants);
router.patch("/admin/:restaurant_id/status", ...adminOnly, controller.updateRestaurantStatus);

// STOREOWNER
router.get("/storeowner/", ...storeownerOnly, controller.getMyRestaurants);
router.post("/storeowner/create", ...storeownerOnly, controller.createRestaurant);
router.put("/storeowner/:restaurant_id", ...storeownerOnly, controller.updateRestaurant);
router.delete("/storeowner/:restaurant_id", ...storeownerOnly, controller.deleteRestaurant);

// PUBLIC
router.get("/", controller.getApprovedRestaurants);
router.get("/:restaurant_id", controller.getRestaurantById);

export default router;