import express from "express";
import { requireDepositoryOrAdmin } from "../middleware/depositoryAuth.js";
import {
  getMoneyLimits,
  createMoneyLimitsFile,
  getAvailableTags,
} from "../controllers/moneyLimitController.js";

const router = express.Router();

/**
 * @swagger
 * /api/moneylimits/tags:
 *   get:
 *     summary: Тэги, доступные вашему депозитарию
 *     tags: [MoneyLimits]
 *     security:
 *       - ApiKeyAuth: []
 *     description: |
 *       Список тэгов (TAG), которые закреплены за депозитарием, чей API-ключ передан в X-API-Key.
 *       В POST /api/moneylimits принимаются только эти тэги, остальные отклоняются с 403 FORBIDDEN_TAG.
 *     responses:
 *       200:
 *         description: Список тэгов
 *         content:
 *           application/json:
 *             example: { "success": true, "data": ["EQTV", "FX"] }
 *       401:
 *         description: Не передан или неверный API-ключ
 *       403:
 *         description: Депозитарий отключён
 */
router.get("/tags", requireDepositoryOrAdmin, getAvailableTags);

/**
 * @swagger
 * /api/moneylimits:
 *   get:
 *     summary: Получить список денежных лимитов
 *     tags: [MoneyLimits]
 *     security:
 *       - ApiKeyAuth: []
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
router.get("/", requireDepositoryOrAdmin, getMoneyLimits);

/**
 * @swagger
 * /api/moneylimits:
 *   post:
 *     summary: Сформировать .lim файл для MONEY
 *     tags: [MoneyLimits]
 *     security:
 *       - ApiKeyAuth: []
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
 *       401:
 *         description: Не передан или неверный API-ключ
 *       403:
 *         description: Тэг не принадлежит вашему депозитарию (файл не сформирован)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Тэг EQTV не принадлежит вашему депозитарию. Доступные вам тэги: FX. Файл не сформирован."
 *               error: FORBIDDEN_TAG
 *               tags: ["EQTV"]
 *               available_tags: ["FX"]
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", requireDepositoryOrAdmin, createMoneyLimitsFile);

export default router;

