import express from "express";
import {
  getMoneyLimits,
  createMoneyLimitsFile,
} from "../controllers/moneyLimitController.js";

const router = express.Router();

/**
 * @swagger
 * /api/moneylimits:
 *   get:
 *     summary: Получить список денежных лимитов
 *     tags: [MoneyLimits]
 *     description: Возвращает список всех денежных лимитов из базы данных
 *     parameters:
 *       - in: query
 *         name: firmId
 *         required: false
 *         schema:
 *           type: string
 *           maxLength: 12
 *         description: Фильтр по идентификатору фирмы
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
 *                   LoadDate:
 *                     type: string
 *                     format: date-time
 *                   FirmId:
 *                     type: string
 *                   ClientCode:
 *                     type: string
 *                   Tag:
 *                     type: string
 *                   CurrCode:
 *                     type: string
 *                   LimitKind:
 *                     type: string
 *                   CurrentBal:
 *                     type: number
 *                   CurrentLimit:
 *                     type: number
 *                   OpenBal:
 *                     type: number
 *                   OpenLimit:
 *                     type: number
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getMoneyLimits);

/**
 * @swagger
 * /api/moneylimits:
 *   post:
 *     summary: Сформировать .lim файл для MONEY
 *     tags: [MoneyLimits]
 *     description: Принимает массив MONEY-лимитов и формирует файл limits.lim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 FIRM_ID:
 *                   type: string
 *                 TAG:
 *                   type: string
 *                 CURR_CODE:
 *                   type: string
 *                 CLIENT_CODE:
 *                   type: string
 *                 LIMIT_KIND:
 *                   type: string
 *                 OPEN_BALANCE:
 *                   type: string
 *                 OPEN_LIMIT:
 *                   type: string
 *                 LEVERAGE:
 *                   type: string
 *           example:
 *             - FIRM_ID: "2002"
 *               TAG: "EQTV"
 *               CURR_CODE: "KGS"
 *               CLIENT_CODE: "12"
 *               LIMIT_KIND: "0"
 *               OPEN_BALANCE: "2000000,00"
 *               OPEN_LIMIT: "0"
 *               LEVERAGE: "-1"
 *     responses:
 *       200:
 *         description: Файл успешно сформирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 filePath:
 *                   type: string
 *                 linesWritten:
 *                   type: number
 *       400:
 *         description: Ошибка валидации данных
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createMoneyLimitsFile);

export default router;

