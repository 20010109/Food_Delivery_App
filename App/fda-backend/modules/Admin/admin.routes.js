import express from "express";
import { authenticate } from "../../middleware/authMiddleware.js";
import { roleCheck } from "../../middleware/roleCheck.js";
import { handleDeleteUser } from "./admin.js";

const router = express.Router();
const adminOnly = [authenticate, roleCheck("admin")];

router.delete("/users/:userId", ...adminOnly, handleDeleteUser);

export default router;
