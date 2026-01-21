import express from "express";
import { createSecurity } from "../controllers/securitiesController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Securities
 *   x-hidden: true
 *   description: API для управления инструментами (акции, фьючерсы, валюта, опционы, спреды, цифровые свидетельства)
 */

/**
 * @swagger
 * /api/securities/stock:
 *   post:
 *     summary: Добавить/изменить акцию
 *     x-hidden: true
 *     tags: [Securities]
 *     description: Создает новый или изменяет существующий инструмент типа «Акция» через хранимую процедуру NewSecurity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *               - GroupName
 *               - SecCode
 *               - ShortName
 *               - FullName
 *               - ISIN
 *               - MinStep
 *               - FaceValue
 *               - FaceUnit
 *               - Scale
 *               - MatDate
 *               - LotSize
 *               - SettleCode
 *               - CalendarName
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *               GroupName:
 *                 type: string
 *                 maxLength: 255
 *               SecCode:
 *                 type: string
 *                 maxLength: 12
 *               ShortName:
 *                 type: string
 *                 maxLength: 32
 *               FullName:
 *                 type: string
 *                 maxLength: 128
 *               ISIN:
 *                 type: string
 *                 maxLength: 12
 *               MinStep:
 *                 type: integer
 *               FaceValue:
 *                 type: number
 *               FaceUnit:
 *                 type: string
 *                 maxLength: 4
 *               Scale:
 *                 type: integer
 *               MatDate:
 *                 type: integer
 *                 description: Дата погашения в формате QUIK
 *               LotSize:
 *                 type: integer
 *               SettleCode:
 *                 type: string
 *                 maxLength: 12
 *               CalendarName:
 *                 type: string
 *                 maxLength: 255
 *               ShortNameEng:
 *                 type: string
 *                 maxLength: 32
 *               FullNameEng:
 *                 type: string
 *                 maxLength: 128
 *               CFI:
 *                 type: string
 *                 maxLength: 6
 *               ListLevel:
 *                 type: integer
 *               SubType:
 *                 type: integer
 *                 nullable: true
 *                 description: Подтип инструмента (0-11)
 *               StockCode:
 *                 type: string
 *                 maxLength: 12
 *               SedolCode:
 *                 type: string
 *                 maxLength: 7
 *               RicCode:
 *                 type: string
 *                 maxLength: 32
 *               CusipCode:
 *                 type: string
 *                 maxLength: 9
 *               FigiCode:
 *                 type: string
 *                 maxLength: 20
 *               QtyScale:
 *                 type: integer
 *                 nullable: true
 *               QtyMultiplier:
 *                 type: integer
 *                 nullable: true
 *               Enabled:
 *                 type: integer
 *                 enum: [0, 1]
 *                 default: 1
 *                 description: Признак доступности инструмента для торговли
 *               RegNumber:
 *                 type: string
 *                 maxLength: 30
 *                 nullable: true
 *               ComplexProduct:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Инструмент успешно добавлен или обновлён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/stock", createSecurity);

export default router;

