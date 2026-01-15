import express from "express";
import { createSettleCode, deleteSettleCode, setClassSettleCode, setSecuritySettleCode } from "../controllers/settleCodesController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SettleCodes
 *   description: API для управления кодами расчетов
 */

/**
 * @swagger
 * /api/settle-codes:
 *   post:
 *     summary: Добавить или изменить код расчетов
 *     tags: [SettleCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [SettleCode, SettleDays]
 *             properties:
 *               SettleCode:
 *                 type: string
 *                 maxLength: 12
 *               SettleDays:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Код расчетов успешно добавлен или изменён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить код расчетов
 *     tags: [SettleCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [SettleCode]
 *             properties:
 *               SettleCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Код расчетов успешно удалён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/settle-codes/set-class:
 *   post:
 *     summary: Привязать код расчетов к классу
 *     tags: [SettleCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SettleCode]
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *               SettleCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Код расчетов успешно привязан к классу
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/settle-codes/set-security:
 *   post:
 *     summary: Привязать код расчетов к инструменту
 *     tags: [SettleCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, SettleCode]
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *               SecCode:
 *                 type: string
 *                 maxLength: 12
 *               SettleCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Код расчетов успешно привязан к инструменту
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createSettleCode);
router.delete("/", deleteSettleCode);
router.post("/set-class", setClassSettleCode);
router.post("/set-security", setSecuritySettleCode);

export default router;

