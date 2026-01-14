import express from "express";
import { getMoneyLimits } from "../controllers/moneyLimitController.js";

const router = express.Router();

// GET /api/moneylimits
router.get("/", getMoneyLimits);

export default router;

