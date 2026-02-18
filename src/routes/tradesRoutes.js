import express from "express";
import { getTrades, getAggregatedTrades } from "../controllers/tradesController.js";

const router = express.Router();

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

