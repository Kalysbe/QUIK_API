import express from "express";
import { getCurrencyInfo } from "../controllers/currencyInfoController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Currency Info
 *   description: API для получения информации о валютах (CurrencyInfo)
 */

/**
 * @swagger
 * /api/currency-info:
 *   get:
 *     summary: Получить список валют (CurrencyInfo)
 *     tags: [Currency Info]
 *     description: |
 *       Возвращает данные из таблицы CurrencyInfo (PostgreSQL).
 *       Поля: TradeDate, CurrCode, CurrFullName.
 *       Фильтрация по любому столбцу через query-параметры.
 *       Примеры: GET /api/currency-info?CurrCode=USD, GET /api/currency-info?TradeDate=20250223&CurrCode=RUB
 *     parameters:
 *       - in: query
 *         name: TradeDate
 *         schema:
 *           type: string
 *         description: Фильтр по дате торгов
 *       - in: query
 *         name: CurrCode
 *         schema:
 *           type: string
 *         description: Фильтр по коду валюты
 *       - in: query
 *         name: CurrFullName
 *         schema:
 *           type: string
 *         description: Фильтр по полному названию валюты
 *     responses:
 *       200:
 *         description: Список валют
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   TradeDate:
 *                     type: string
 *                   CurrCode:
 *                     type: string
 *                   CurrFullName:
 *                     type: string
 *       404:
 *         description: Таблица CurrencyInfo не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getCurrencyInfo);

export default router;
