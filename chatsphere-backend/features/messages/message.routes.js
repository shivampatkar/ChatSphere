import { Router } from "express";
import { fetchMessages } from "./message.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, fetchMessages);

export default router;
