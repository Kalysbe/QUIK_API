import express from "express";
import {
    createClass,
    createBondClass,
    createFutClass,
    createFxClass,
    createOptClass,
    createSpreadClass,
    createCertificateClass,
} from "../controllers/classesController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: API для управления классами инструментов
 */

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Добавить класс инструментов
 *     tags: [Classes]
 *     description: Создает новый класс инструментов через хранимую процедуру NewClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *                 description: Код класса
 *     responses:
 *       200:
 *         description: Класс успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createClass);

/**
 * @swagger
 * /api/classes/bond:
 *   post:
 *     summary: Добавить класс облигаций
 *     tags: [Classes]
 *     description: Создает новый класс облигаций через хранимую процедуру NewBondClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *               - MatchingMode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *                 description: Код класса
 *               MatchingMode:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Режим сведения заявок. 0 - двойной встречный аукцион, 1 - односторонний аукцион
 *     responses:
 *       200:
 *         description: Класс облигаций успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/bond", createBondClass);

/**
 * @swagger
 * /api/classes/futures:
 *   post:
 *     summary: Добавить класс фьючерсов
 *     tags: [Classes]
 *     description: Создает новый класс фьючерсов через хранимую процедуру NewFutClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *                 description: Код класса
 *     responses:
 *       200:
 *         description: Класс фьючерсов успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/futures", createFutClass);

/**
 * @swagger
 * /api/classes/fx:
 *   post:
 *     summary: Добавить класс валютообмена
 *     tags: [Classes]
 *     description: Создает новый класс валютообмена через хранимую процедуру NewFxClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *                 description: Код класса
 *     responses:
 *       200:
 *         description: Класс валютообмена успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/fx", createFxClass);

/**
 * @swagger
 * /api/classes/options:
 *   post:
 *     summary: Добавить класс опционов
 *     tags: [Classes]
 *     description: Создает новый класс опционов через хранимую процедуру NewOptClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *                 description: Код класса
 *     responses:
 *       200:
 *         description: Класс опционов успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/options", createOptClass);

/**
 * @swagger
 * /api/classes/spread:
 *   post:
 *     summary: Добавить класс спредов
 *     tags: [Classes]
 *     description: Создает новый класс спредов через хранимую процедуру NewSpreadClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *               - MatchingMode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *                 description: Код класса
 *               MatchingMode:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Режим сведения заявок. 0 - двойной встречный аукцион, 1 - односторонний аукцион
 *               ZeroOrNegativePriceAllowed:
 *                 type: integer
 *                 description: Признак допустимости ввода отрицательных цен
 *     responses:
 *       200:
 *         description: Класс спредов успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/spread", createSpreadClass);

/**
 * @swagger
 * /api/classes/certificate:
 *   post:
 *     summary: Добавить класс цифровых свидетельств
 *     tags: [Classes]
 *     description: Создает новый класс цифровых свидетельств через хранимую процедуру NewCertificateClass.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ClassCode
 *             properties:
 *               ClassCode:
 *                 type: string
 *                 maxLength: 12
 *                 description: Код класса
 *     responses:
 *       200:
 *         description: Класс цифровых свидетельств успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка (конфликт данных)
 *       500:
 *         description: Ошибка сервера
 */
router.post("/certificate", createCertificateClass);

export default router;

