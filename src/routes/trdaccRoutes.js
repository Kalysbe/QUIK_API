import express from "express";
import { getTrdaccs } from "../controllers/trdaccController.js";

const router = express.Router();

/**
 * @swagger
 * /api/trdaccs:
 *   get:
 *     summary: Получить список торговых счетов
 *     tags: [Trdaccs]
 *     description: Возвращает список торговых счетов. Можно фильтровать по FirmId через query параметр
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
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getTrdaccs);

export default router;

