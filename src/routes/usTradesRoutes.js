import express from "express";
import { getUsTrades } from "../controllers/usTradesController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UsTrades
 *   description: Сделки для исполнения (таблица UsTrades в PostgreSQL)
 */

/**
 * @swagger
 * /api/us-trades:
 *   get:
 *     summary: Получить сделки для исполнения
 *     tags: [UsTrades]
 *     description: |
 *       Возвращает записи из таблицы UsTrades (сделки для исполнения).
 *       Фильтрация по любому столбцу таблицы через query-параметры.
 *       Пример: GET /api/us-trades?FirmId=ABC&SecCode=GAZP
 *     parameters:
 *       - in: query
 *         name: FirmId
 *         required: false
 *         description: Пример фильтра. Любой столбец таблицы UsTrades можно передать как query-параметр
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Ограничение количества записей (макс. 100000)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список сделок для исполнения
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *       404:
 *         description: Таблица UsTrades не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getUsTrades);

export default router;
