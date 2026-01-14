import express from "express";
import { getInstruments, createInstrument } from "../controllers/bondController.js";

const router = express.Router();

// GET /api/instruments
router.get("/", getInstruments);

// POST /api/instruments
router.post("/", createInstrument);

export default router;
