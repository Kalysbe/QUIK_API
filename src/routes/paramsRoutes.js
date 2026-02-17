import express from "express";
import { getParams } from "../controllers/paramsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Params
 *   description: API для работы с параметрами (таблица Params в PostgreSQL)
 */

/**
 * @swagger
 * /api/params:
 *   get:
 *     summary: Получить параметры (Params)
 *     tags: [Params]
 *     description: Возвращает данные из таблицы Params (PostgreSQL) с фильтрацией по любому столбцу через query-параметры. Пример GET /api/params?paramName=value
 *     parameters:
 *       - in: query
 *         name: paramName
 *         description: Пример фильтра. Любой столбец таблицы Params можно передать как query-параметр
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список записей из Params
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Некорректные параметры фильтрации
 *       404:
 *         description: Таблица Params не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", getParams);

export default router;
