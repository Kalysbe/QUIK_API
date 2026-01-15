import express from "express";
import { getLastTradingDateTime } from "../controllers/lastTradingDateTimeController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: LastTradingDateTime
 *   description: API для получения даты и времени последней транзакции
 */

/**
 * @swagger
 * /api/last-trading-date-time:
 *   get:
 *     summary: Получить дату и время последней транзакции
 *     tags: [LastTradingDateTime]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getLastTradingDateTime);

export default router;

