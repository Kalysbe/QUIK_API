import express from "express";
import { setComplexProduct } from "../controllers/complexProductController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ComplexProduct
 *   x-hidden: true
 *   description: API для управления сложными финансовыми продуктами
 */

/**
 * @swagger
 * /api/complex-product:
 *   post:
 *     summary: Установить тип сложного финансового продукта
 *     tags: [ComplexProduct]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, ComplexProduct]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               ComplexProduct:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Тип сложного финансового продукта установлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", setComplexProduct);

export default router;

