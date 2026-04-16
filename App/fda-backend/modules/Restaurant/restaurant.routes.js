import express from "express";
import * as controller from "./restaurant.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";

const router = express.Router();

const storeownerOnly = [authenticate, roleCheck("storeowner")];

// Get all APPROVED restaurants (for frontend)
router.get("/", controller.getApprovedRestaurants);
router.get("/:restaurant_id", controller.getRestaurantById);

router.post("/create", ...storeownerOnly, controller.createRestaurant);
router.get("/my", ...storeownerOnly, controller.getMyRestaurants);
router.put("/:restaurant_id", ...storeownerOnly, controller.updateRestaurant);
router.delete("/:restaurant_id", ...storeownerOnly, controller.deleteRestaurant);


export default router;