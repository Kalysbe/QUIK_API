import express from "express";
import { getTrdaccs } from "../controllers/trdaccController.js";

const router = express.Router();

// GET /api/trdaccs
// GET /api/trdaccs?FirmId=значение (фильтрация по FirmId)
router.get("/", getTrdaccs);

export default router;

