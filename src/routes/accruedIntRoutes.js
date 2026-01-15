import express from "express";
import { addAccruedInt, delAccruedInt, setAccruedIntCalculateMode } from "../controllers/accruedIntController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AccruedInt
 *   description: API для управления НКД
 */

/**
 * @swagger
 * /api/accrued-int:
 *   post:
 *     summary: Добавить НКД
 *     tags: [AccruedInt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [SecCode, Date, ACI]
 *             properties:
 *               SecCode:
 *                 type: string
 *               Date:
 *                 type: integer
 *               ACI:
 *                 type: number
 *               CurrencyCode:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: НКД добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить НКД
 *     tags: [AccruedInt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [SecCode, Date]
 *             properties:
 *               SecCode:
 *                 type: string
 *               Date:
 *                 type: integer
 *               CurrencyCode:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: НКД удалён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/accrued-int/calculate-mode:
 *   post:
 *     summary: Установить режим расчета НКД
 *     tags: [AccruedInt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [AssetCode]
 *             properties:
 *               AssetCode:
 *                 type: string
 *               CalcModeACI:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Режим расчета НКД установлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", addAccruedInt);
router.delete("/", delAccruedInt);
router.post("/calculate-mode", setAccruedIntCalculateMode);

export default router;

