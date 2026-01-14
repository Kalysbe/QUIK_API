import express from "express";
import { getFirms } from "../controllers/firmController.js";

const router = express.Router();

// GET /api/firms
router.get("/", getFirms);

export default router;

