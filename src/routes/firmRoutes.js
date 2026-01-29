import express from "express";
import { getFirms, createFirm, addFirmToClass } from "../controllers/firmController.js";

const router = express.Router();

/**
 * @swagger
 * /api/firms:
 *   get:
 *     summary: Получить список фирм
 *     tags: [Firms]
 *     description: Возвращает список всех фирм из базы данных
 *     parameters:
 *       - in: query
 *         name: firmId
 *         required: false
 *         schema:
 *           type: string
 *           maxLength: 12
 *         description: Фильтр по идентификатору фирмы
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
 *                   Exchange:
 *                     type: string
 *                   FirmId:
 *                     type: string
 *                   FirmName:
 *                     type: string
 *                   Status:
 *                     type: string
 *                   StatusFlag:
 *                     type: integer
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getFirms);

/**
 * @swagger
 * /api/firms:
 *   post:
 *     summary: Добавить фирму
 *     tags: [Firms]
 *     description: Создает новую фирму через хранимую процедуру NewFirm.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - FirmCode
 *               - FirmName
 *               - Permissions
 *               - Exchange
 *             properties:
 *               FirmCode:
 *                 type: string
 *                 maxLength: 12
 *               FirmName:
 *                 type: string
 *                 maxLength: 30
 *               Permissions:
 *                 type: integer
 *               Exchange:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Фирма успешно добавлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createFirm);

/**
 * @swagger
 * /api/firms/add-to-class:
 *   post:
 *     summary: Привязать фирму к классу
 *     tags: [Firms]
 *     description: Привязывает фирму к классу инструментов через хранимую процедуру AddFirmToClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - FirmCode
 *               - ClassCode
 *             properties:
 *               FirmCode:
 *                 type: string
 *                 maxLength: 12
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Фирма успешно привязана к классу
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/add-to-class", addFirmToClass);

export default router;

