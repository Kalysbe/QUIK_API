import express from "express";
import { createTag, addTagToClass } from "../controllers/tagsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   x-hidden: true
 *   description: API для управления кодами позиций
 */

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Добавить код позиции
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Tag]
 *             properties:
 *               Tag:
 *                 type: string
 *                 maxLength: 4
 *     responses:
 *       200:
 *         description: Код позиции успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/tags/add-to-class:
 *   post:
 *     summary: Привязать код позиции к классу
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Tag, ClassCode]
 *             properties:
 *               Tag:
 *                 type: string
 *                 maxLength: 4
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Код позиции успешно привязан к классу
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createTag);
router.post("/add-to-class", addTagToClass);

export default router;

