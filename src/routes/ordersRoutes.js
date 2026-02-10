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
 *     description: Возвращает данные из таблицы Orders (PostgreSQL) с фильтрацией по любому столбцу.
 *       Фильтры можно передать как query-параметры (имя столбца = значение) или в параметре filters (JSON).
 *     parameters:
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON-строка объекта фильтров по столбцам таблицы Orders
 *       - in: query
 *         name: {column_name}
 *         description: Любой столбец таблицы Orders — фильтр по равенству (например order_num=123)
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
