import express from "express";
import * as controller from "./restaurant.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";

const router = express.Router();

const customerOnly = [authenticate, roleCheck("customer")]
const storeownerOnly = [authenticate, roleCheck("storeowner")];
const adminOnly = [authenticate, roleCheck("admin")];

// ADMIN (PUT THIS FIRST)
router.get("/admin", ...adminOnly, controller.getAllRestaurants);
router.patch("/admin/:restaurant_id/status", ...adminOnly, controller.updateRestaurantStatus);

// APPLY AS STOREOWNER
router.post("/apply-storeowner", ...customerOnly ,controller.applyStoreOwner);

// STOREOWNER
router.get("/storeowner/", ...storeownerOnly, controller.getMyRestaurants);
//router.post("/create", ...storeownerOnly, controller.createRestaurant); // OBSOLETE
router.put("/storeowner/:restaurant_id", ...storeownerOnly, controller.updateRestaurant);
router.delete("/storeowner/:restaurant_id", ...storeownerOnly, controller.deleteRestaurant);

// PUBLIC
router.get("/", controller.getApprovedRestaurants);
router.get("/:restaurant_id", controller.getRestaurantById);

export default router;