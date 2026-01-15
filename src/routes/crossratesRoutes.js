import express from "express";
import { getCrossrates, editCrossrate } from "../controllers/crossratesController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Crossrates
 *   description: API для управления кросс-курсами
 */

/**
 * @swagger
 * /api/crossrates:
 *   get:
 *     summary: Получить кросс-курсы
 *     tags: [Crossrates]
 *     parameters:
 *       - in: query
 *         name: Date
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Список кросс-курсов
 *       500:
 *         description: Ошибка сервера
 *   post:
 *     summary: Добавить/изменить/удалить кросс-курс
 *     tags: [Crossrates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Action, CurrencyCode, Rate]
 *             properties:
 *               Action:
 *                 type: integer
 *                 enum: [0, 1, 2]
 *               CurrencyCode:
 *                 type: string
 *               Rate:
 *                 type: number
 *               Date:
 *                 type: integer
 *                 nullable: true
 *               IsMainCurrency:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Кросс-курс обработан
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getCrossrates);
router.post("/", editCrossrate);

export default router;

