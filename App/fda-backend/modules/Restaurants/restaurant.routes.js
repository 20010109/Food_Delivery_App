import express from "express";
import * as controller from "./restaurants.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";

const router = express.Router();

// Only storeowners can access all routes
router.use(authMiddleware, roleCheck("storeowner"));

router.post("/", controller.createRestaurant);
router.get("/", controller.getMyRestaurants);
router.put("/:id", controller.updateRestaurant);
router.delete("/:id", controller.deleteRestaurant);

export default router;