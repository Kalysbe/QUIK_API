import express from "express";
import { getSecurityExtraParamsValues, editSecurityExtraParamsValue } from "../controllers/extraParamsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ExtraParams
 *   x-hidden: true
 *   description: API для управления дополнительными параметрами
 */

/**
 * @swagger
 * /api/extra-params:
 *   get:
 *     summary: Получить дополнительные параметры инструмента
 *     tags: [ExtraParams]
 *     parameters:
 *       - in: query
 *         name: ClassCode
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: SecCode
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Список параметров
 *       400:
 *         description: Ошибка валидации данных
 *       500:
 *         description: Ошибка сервера
 *   post:
 *     summary: Редактировать дополнительный параметр
 *     tags: [ExtraParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Action, Classcode, Seccode, ParamDbName, Value]
 *             properties:
 *               Action:
 *                 type: integer
 *               Classcode:
 *                 type: string
 *               Seccode:
 *                 type: string
 *               ParamDbName:
 *                 type: string
 *               Value:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Параметр успешно обработан
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getSecurityExtraParamsValues);
router.post("/", editSecurityExtraParamsValue);

export default router;

