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
 *     summary: Получить активные заявки (State = "Активна")
 *     tags: [Orders]
 *     description: |
 *       Возвращает только заявки со статусом "Активна".
 *       Поля: OrderNum, ClassCode, SecCode, Price, Qty, Value, OrderDateTime, Operation, State.
 *       Фильтрация по всем указанным столбцам через query-параметры.
 *     parameters:
 *       - in: query
 *         name: OrderNum
 *         required: false
 *         description: Фильтр по номеру заявки
 *         schema:
 *           type: string
 *       - in: query
 *         name: ClassCode
 *         required: false
 *         description: Фильтр по коду класса (например, TQBR)
 *         schema:
 *           type: string
 *       - in: query
 *         name: SecCode
 *         required: false
 *         description: Фильтр по коду бумаги
 *         schema:
 *           type: string
 *       - in: query
 *         name: Price
 *         required: false
 *         description: Фильтр по цене
 *         schema:
 *           type: number
 *       - in: query
 *         name: Qty
 *         required: false
 *         description: Фильтр по количеству
 *         schema:
 *           type: number
 *       - in: query
 *         name: Value
 *         required: false
 *         description: Фильтр по сумме
 *         schema:
 *           type: number
 *       - in: query
 *         name: OrderDateTime
 *         required: false
 *         description: Фильтр по дате/времени заявки
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: Operation
 *         required: false
 *         description: Фильтр по операции (Купля/Продажа)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список активных заявок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   OrderNum:
 *                     type: string
 *                   ClassCode:
 *                     type: string
 *                   SecCode:
 *                     type: string
 *                   Price:
 *                     type: number
 *                   Qty:
 *                     type: number
 *                   Value:
 *                     type: number
 *                   OrderDateTime:
 *                     type: string
 *                     format: date-time
 *                   Operation:
 *                     type: string
 *                   State:
 *                     type: string
 *                     example: "Активна"
 *       400:
 *         description: Не найдена колонка State в таблице Orders
 *       404:
 *         description: Таблица Orders не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getOrders);

export default router;
