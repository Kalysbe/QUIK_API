import express from "express";
import {
  getDepoLimits,
  createDepoLimitsFile,
  getAvailableAccounts,
} from "../controllers/depoLimitController.js";
import { requireDepositoryOrAdmin } from "../middleware/depositoryAuth.js";

const router = express.Router();

/**
 * @swagger
 * /api/depolimits/accounts:
 *   get:
 *     summary: Торговые счета, доступные вашему депозитарию
 *     tags: [DepoLimits]
 *     security:
 *       - ApiKeyAuth: []
 *     description: |
 *       Торговые счета (TRDACCID), закреплённые за депозитарием, чей API-ключ передан в X-API-Key.
 *       В POST /api/depolimits принимаются только они, остальные отклоняются с 403 FORBIDDEN_ACCOUNT.
 *     responses:
 *       200:
 *         description: Список счетов
 *         content:
 *           application/json:
 *             example: { "success": true, "data": ["1-3101-2002", "1-3101-2003"] }
 *       401:
 *         description: Не передан или неверный API-ключ
 *       403:
 *         description: Депозитарий отключён
 */
router.get("/accounts", requireDepositoryOrAdmin, getAvailableAccounts);

/**
 * @swagger
 * /api/depolimits:
 *   get:
 *     summary: Получить список позиций по инструментам
 *     tags: [DepoLimits]
 *     security:
 *       - ApiKeyAuth: []
 *     description: Возвращает список всех позиций по инструментам
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
 *                   SecCode:
 *                     type: string
 *                   Trdacc:
 *                     type: string
 *                   LimitKind:
 *                     type: string
 *                   LockedBuy:
 *                     type: number
 *                   CurrentBal:
 *                     type: number
 *                   CurrentLimit:
 *                     type: number
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", requireDepositoryOrAdmin, getDepoLimits);

/**
 * @swagger
 * /api/depolimits:
 *   post:
 *     summary: Сформировать .lim файл для DEPO
 *     tags: [DepoLimits]
 *     security:
 *       - ApiKeyAuth: []
 *     description: Принимает массив DEPO-лимитов и формирует файл limits.lim
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
 *                 SECCODE:
 *                   type: string
 *                 CLIENT_CODE:
 *                   type: string
 *                 LIMIT_KIND:
 *                   type: string
 *                 OPEN_BALANCE:
 *                   type: string
 *                 OPEN_LIMIT:
 *                   type: string
 *                 TRDACCID:
 *                   type: string
 *           example:
 *             - FIRM_ID: "2002"
 *               SECCODE: "GD0528"
 *               CLIENT_CODE: "12"
 *               LIMIT_KIND: "0"
 *               OPEN_BALANCE: "0"
 *               OPEN_LIMIT: "0"
 *               TRDACCID: "1-3101-2002"
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
 *         description: Торговый счёт не принадлежит вашему депозитарию (файл не сформирован)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Торговый счёт 1-3001-2002 не принадлежит вашему депозитарию. Доступные вам счета: 1-3101-2002. Файл не сформирован."
 *               error: FORBIDDEN_ACCOUNT
 *               accounts: ["1-3001-2002"]
 *               available_accounts: ["1-3101-2002"]
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", requireDepositoryOrAdmin, createDepoLimitsFile);

export default router;

