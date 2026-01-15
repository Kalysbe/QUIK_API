import express from "express";
import {
    createSecurityPriceLimitByRange,
    createSecurityPriceLimitByMiddlePrice,
    deleteSecurityPriceLimit,
} from "../controllers/priceLimitsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PriceLimits
 *   description: API для управления ограничениями цен
 */

/**
 * @swagger
 * /api/price-limits/range:
 *   post:
 *     summary: Установить диапазон цен
 *     tags: [PriceLimits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, MinPrice, MaxPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               MinPrice:
 *                 type: number
 *               MaxPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ограничение цен по диапазону установлено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/price-limits/middle-price:
 *   post:
 *     summary: Установить ограничение по средней цене
 *     tags: [PriceLimits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, MiddlePrice, LPercent]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               MiddlePrice:
 *                 type: number
 *               LPercent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ограничение по средней цене установлено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/price-limits:
 *   delete:
 *     summary: Удалить ценовое ограничение
 *     tags: [PriceLimits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ценовое ограничение удалено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/range", createSecurityPriceLimitByRange);
router.post("/middle-price", createSecurityPriceLimitByMiddlePrice);
router.delete("/", deleteSecurityPriceLimit);

export default router;

