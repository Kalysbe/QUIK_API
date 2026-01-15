import express from "express";
import { getCoupons, editCoupon } from "../controllers/couponsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: API для управления купонами
 */

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Получить значения купонов
 *     tags: [Coupons]
 *     parameters:
 *       - in: query
 *         name: AssetCode
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Список купонов
 *       500:
 *         description: Ошибка сервера
 *   post:
 *     summary: Добавить/изменить/удалить купон
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Action, AssetCode, EmitDate, ExpireDate]
 *             properties:
 *               Action:
 *                 type: integer
 *                 enum: [0, 1, 2]
 *               AssetCode:
 *                 type: string
 *               EmitDate:
 *                 type: integer
 *               ExpireDate:
 *                 type: integer
 *               Value:
 *                 type: number
 *                 nullable: true
 *               ValueUnits:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Купон успешно обработан
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/coupons/{assetCode}:
 *   get:
 *     summary: Получить значения купонов по активу
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: assetCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список купонов
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getCoupons);
router.get("/:assetCode", getCoupons);
router.post("/", editCoupon);

export default router;

