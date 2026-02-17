import express from "express";
import { getTrades } from "../controllers/tradesController.js";

const router = express.Router();

/**
 * @swagger
 * /api/trades:
 *   get:
 *     summary: Получить список сделок
 *     tags: [Trades]
 *     description: Возвращает все сделки из таблицы Trades. Фильтрация через query-параметры. Пример GET /api/trades?FirmId=ABC&SecCode=GAZP
 *     parameters:
 *       - in: query
 *         name: FirmId
 *         required: false
 *         description: Пример фильтра. Любой столбец таблицы Trades можно передать как query-параметр
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getTrades);

export default router;

