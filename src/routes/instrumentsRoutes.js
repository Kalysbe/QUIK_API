import express from "express";
import { getInstruments, createInstrument } from "../controllers/bondController.js";

const router = express.Router();

/**
 * @swagger
 * /api/instruments:
 *   get:
 *     summary: Получить список инструментов
 *     tags: [Instruments]
 *     description: Возвращает список всех инструментов из базы данных со всеми столбцами. Можно фильтровать по ClassCode и SecCode.
 *     parameters:
 *       - in: query
 *         name: ClassCode
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: SecCode
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getInstruments);

/**
 * @swagger
 * /api/instruments:
 *   post:
 *     summary: Создать новый инструмент
 *     tags: [Instruments]
 *     description: Создает новый инструмент через хранимую процедуру NewBondSecurity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *               - SecCode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *               SecCode:
 *                 type: string
 *                 maxLength: 12
 *               ShortNameRus:
 *                 type: string
 *                 maxLength: 32
 *               FullNameRus:
 *                 type: string
 *                 maxLength: 128
 *               ISIN:
 *                 type: string
 *                 maxLength: 12
 *               FaceValue:
 *                 type: number
 *               Currency:
 *                 type: string
 *                 maxLength: 4
 *     responses:
 *       200:
 *         description: Инструмент успешно создан
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createInstrument);

export default router;
