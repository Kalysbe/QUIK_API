import express from "express";
import { getLogs, exportLogsCsv } from "../controllers/logsController.js";

const router = express.Router();

// Получение логов с фильтрацией и пагинацией
router.get("/", getLogs);

// Экспорт логов в CSV
router.get("/export", exportLogsCsv);

export default router;

