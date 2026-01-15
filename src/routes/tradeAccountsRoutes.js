import express from "express";
import { createTradeAccount, addAccountToClass } from "../controllers/tradeAccountsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TradeAccounts
 *   description: API для управления торговыми счетами
 */

/**
 * @swagger
 * /api/trade-accounts:
 *   post:
 *     summary: Добавить торговый счет
 *     tags: [TradeAccounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - FirmCode
 *               - Account
 *             properties:
 *               FirmCode:
 *                 type: string
 *                 maxLength: 12
 *               Account:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Торговый счет успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createTradeAccount);

/**
 * @swagger
 * /api/trade-accounts/add-to-class:
 *   post:
 *     summary: Привязать торговый счет к классу
 *     tags: [TradeAccounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - FirmCode
 *               - Account
 *               - ClassCode
 *             properties:
 *               FirmCode:
 *                 type: string
 *                 maxLength: 12
 *               Account:
 *                 type: string
 *                 maxLength: 12
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Торговый счет успешно привязан к классу
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/add-to-class", addAccountToClass);

export default router;

