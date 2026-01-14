import express from "express";
import { getDepoLimits } from "../controllers/depoLimitController.js";

const router = express.Router();

// GET /api/depolimits
router.get("/", getDepoLimits);

export default router;

