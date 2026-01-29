import express from "express";
import {
  getDepoLimits,
  createDepoLimitsFile,
} from "../controllers/depoLimitController.js";

const router = express.Router();

/**
 * @swagger
 * /api/depolimits:
 *   get:
 *     summary: Получить список позиций по инструментам
 *     tags: [DepoLimits]
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
router.get("/", getDepoLimits);

/**
 * @swagger
 * /api/depolimits:
 *   post:
 *     summary: Сформировать .lim файл для DEPO
 *     tags: [DepoLimits]
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
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createDepoLimitsFile);

export default router;

