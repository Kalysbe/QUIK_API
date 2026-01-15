import express from "express";
import { getFaceValues, addFaceValue, delFaceValue } from "../controllers/faceValuesController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FaceValues
 *   description: API для управления номиналами облигаций
 */

/**
 * @swagger
 * /api/face-values:
 *   get:
 *     summary: Получить номиналы облигаций
 *     tags: [FaceValues]
 *     parameters:
 *       - in: query
 *         name: SecCode
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Список номиналов
 *       500:
 *         description: Ошибка сервера
 *   post:
 *     summary: Добавить номинал
 *     tags: [FaceValues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [SecCode, Date, FaceValue]
 *             properties:
 *               SecCode:
 *                 type: string
 *               Date:
 *                 type: integer
 *               FaceValue:
 *                 type: number
 *               FaceUnit:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Номинал добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить номинал
 *     tags: [FaceValues]
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
 *               FaceUnit:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Номинал удалён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/face-values/{secCode}:
 *   get:
 *     summary: Получить номиналы по инструменту
 *     tags: [FaceValues]
 *     parameters:
 *       - in: path
 *         name: secCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список номиналов
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getFaceValues);
router.get("/:secCode", getFaceValues);
router.post("/", addFaceValue);
router.delete("/", delFaceValue);

export default router;

