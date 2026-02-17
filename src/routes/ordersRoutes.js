import express from "express";
import { getOrders } from "../controllers/ordersController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API для работы с заявками (таблица Orders в PostgreSQL)
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Получить заявки (Orders)
 *     tags: [Orders]
 *     description: Возвращает данные из таблицы Orders (PostgreSQL) с фильтрацией по любому столбцу через query-параметры. Пример GET /api/orders?status=paid&userId=123&sortBy=createdAt&order=desc&page=2&limit=50
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Пример фильтра — статус заявки. Любой столбец таблицы Orders можно передать как query-параметр
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список заявок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Некорректные параметры фильтрации
 *       404:
 *         description: Таблица Orders не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getOrders);

export default router;
