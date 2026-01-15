import express from "express";
import { getDepoLimits } from "../controllers/depoLimitController.js";

const router = express.Router();

/**
 * @swagger
 * /api/depolimits:
 *   get:
 *     summary: Получить список позиций по инструментам
 *     tags: [DepoLimits]
 *     description: Возвращает список всех позиций по инструментам
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

export default router;

