import express from "express";
import { getMoneyLimits } from "../controllers/moneyLimitController.js";

const router = express.Router();

/**
 * @swagger
 * /api/moneylimits:
 *   get:
 *     summary: Получить список денежных лимитов
 *     tags: [MoneyLimits]
 *     description: Возвращает список всех денежных лимитов из базы данных
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

export default router;

