import express from "express";
import { getTrdaccs } from "../controllers/trdaccController.js";
import { requireDepositoryOrAdmin } from "../middleware/depositoryAuth.js";

const router = express.Router();

/**
 * @swagger
 * /api/trdaccs:
 *   get:
 *     summary: Получить список торговых счетов
 *     tags: [TradeAccounts]
 *     security:
 *       - ApiKeyAuth: []
 *     description: |
 *       Возвращает торговые счета, закреплённые за вашим депозитарием. Можно фильтровать по FirmId через query параметр.
 *     parameters:
 *       - in: query
 *         name: FirmId
 *         schema:
 *           type: string
 *         description: Фильтр по идентификатору фирмы
 *         required: false
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
 *                   TrdAccId:
 *                     type: string
 *                   Type:
 *                     type: string
 *                   FirmId:
 *                     type: string
 *                   LoadDate:
 *                     type: string
 *                     format: date-time
 *                   Description:
 *                     type: string
 *                   Status:
 *                     type: integer
 *                   BankAccId:
 *                     type: string
 *                   DepAccId:
 *                     type: string
 *       401:
 *         description: Не передан или неверный API-ключ
 *       403:
 *         description: Депозитарий отключён
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", requireDepositoryOrAdmin, getTrdaccs);

export default router;

