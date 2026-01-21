import express from "express";
import { getTrades } from "../controllers/tradesController.js";

const router = express.Router();

/**
 * @swagger
 * /api/trades:
 *   get:
 *     summary: Получить список сделок
 *     tags: [Trades]
 *     description: Возвращает все сделки из таблицы Trades. Любой query параметр, совпадающий с именем столбца, используется для фильтрации. Можно также передать объект filters.
 *     parameters:
 *       - in: query
 *         name: filters
 *         required: false
 *         description: >-
 *           Фильтры по столбцам. Можно передать объект через filters[Column]=value
 *           или JSON-строкой объекта. Пример: {"FirmId":"ABC","SecCode":"GAZP"}.
 *         style: deepObject
 *         explode: true
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: object
 *               additionalProperties: true
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

