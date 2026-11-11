import express from "express";
import {
  getTrades,
  getAggregatedTrades,
  getTradesSecCodes,
  getAvailableClasses,
} from "../controllers/tradesController.js";
import { requireDepositoryOrAdmin } from "../middleware/depositoryAuth.js";

const router = express.Router();

/**
 * @swagger
 * /api/trades/classes:
 *   get:
 *     summary: Классы, доступные вашему депозитарию
 *     tags: [Trades]
 *     security:
 *       - ApiKeyAuth: []
 *     description: |
 *       Классы (ClassCode), закреплённые за депозитарием, чей API-ключ передан в X-API-Key.
 *       GET /api/trades возвращает сделки только по этим классам.
 *     responses:
 *       200:
 *         description: Список классов
 *         content:
 *           application/json:
 *             example: { "success": true, "data": ["EQTV", "GSCB"] }
 *       401:
 *         description: Не передан или неверный API-ключ
 *       403:
 *         description: Депозитарий отключён
 */
router.get("/classes", requireDepositoryOrAdmin, getAvailableClasses);

/**
 * @swagger
 * /api/trades/aggregated:
 *   get:
 *     summary: Получить агрегированные сделки (временной ряд цен)
 *     tags: [Trades]
 *     description: |
 *       Возвращает сделки в формате 1 запись = 1 реальная сделка.
 *       В БД каждая сделка хранится двумя строками (Купля + Продажа); эндпоинт объединяет их в одну.
 *       Используется для аналитики цен по инструментам.
 *     parameters:
 *       - in: query
 *         name: ClassCode
 *         required: false
 *         description: Фильтр по коду инструмента (класса)
 *         schema:
 *           type: string
 *       - in: query
 *         name: SecCode
 *         required: false
 *         description: Фильтр по коду бумаги (если колонка SecCode есть в таблице)
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         required: false
 *         description: Начало диапазона дат (ISO или timestamp)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         required: false
 *         description: Конец диапазона дат (ISO или timestamp)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Ограничение количества записей (по умолчанию 10000, макс 100000)
 *         schema:
 *           type: integer
 *           default: 10000
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ClassCode:
 *                     type: string
 *                     description: Код класса/рынка
 *                   SecCode:
 *                     type: string
 *                     description: Код бумаги (из колонки SecCode или ClassCode)
 *                   Price:
 *                     type: number
 *                     description: Цена сделки
 *                   Qty:
 *                     type: number
 *                     description: Количество
 *                   Value:
 *                     type: number
 *                     description: Сумма сделки (Price * Qty или из БД)
 *                   TradeDateTime:
 *                     type: string
 *                     format: date-time
 *                     description: Дата и время сделки
 *       400:
 *         description: Отсутствуют обязательные колонки в таблице Trades
 *       500:
 *         description: Ошибка сервера
 */
router.get("/aggregated", getAggregatedTrades);

/**
 * @swagger
 * /api/trades/sec-codes:
 *   get:
 *     summary: Получить список SecCode в таблице Trades
 *     tags: [Trades]
 *     description: |
 *       Возвращает массив уникальных значений SecCode из таблицы Trades.
 *       Если колонка SecCode отсутствует, используется ClassCode.
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["GAZP", "SBER", "LKOH"]
 *       400:
 *         description: Не найдены колонки ClassCode или SecCode
 *       500:
 *         description: Ошибка сервера
 */
router.get("/sec-codes", getTradesSecCodes);

/**
 * @swagger
 * /api/trades:
 *   get:
 *     summary: Получить список сделок
 *     tags: [Trades]
 *     security:
 *       - ApiKeyAuth: []
 *     description: |
 *       Возвращает сделки из таблицы Trades. Фильтрация через query-параметры. Пример GET /api/trades?FirmId=ABC&SecCode=GAZP
 *       Возвращаются только сделки по классам, закреплённым за вашим депозитарием.
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
 *       401:
 *         description: Не передан или неверный API-ключ
 *       403:
 *         description: Запрошен класс (ClassCode), не принадлежащий вашему депозитарию
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Класс GSCB не принадлежит вашему депозитарию. Доступные вам классы: EQTV."
 *               error: FORBIDDEN_CLASS
 *               classes: ["GSCB"]
 *               available_classes: ["EQTV"]
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", requireDepositoryOrAdmin, getTrades);

export default router;

