import express from "express";
import { createCoreGroup } from "../controllers/coreGroupsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CoreGroups
 *   description: API для управления группами мэтчинговых ядер
 */

/**
 * @swagger
 * /api/core-groups:
 *   post:
 *     summary: Добавить группу мэтчинговых ядер
 *     tags: [CoreGroups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [GroupName]
 *             properties:
 *               GroupName:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Группа мэтчинговых ядер успешно добавлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createCoreGroup);

export default router;

