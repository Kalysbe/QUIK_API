import express from "express";
import { createScheduleAction } from "../controllers/schedulesController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: API для управления расписаниями торгов
 */

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Добавить событие расписания торгов
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, EventCode, EventTime]
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *               SecCode:
 *                 type: string
 *                 maxLength: 12
 *               EventCode:
 *                 type: string
 *                 maxLength: 9
 *               EventTime:
 *                 type: string
 *                 maxLength: 9
 *               CancelOrders:
 *                 type: integer
 *               ApplyTradesStopOrders:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Событие расписания успешно добавлено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createScheduleAction);

export default router;

