import express from "express";
import { getParams, getParamsDetails } from "../controllers/paramsController.js";

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

/**
 * @swagger
 * /api/params/details/{ClassCode}/{SecCode}:
 *   get:
 *     summary: Получить полные детали инструмента по ClassCode и SecCode
 *     tags: [Params]
 *     parameters:
 *       - in: path
 *         name: ClassCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Код класса инструмента
 *       - in: path
 *         name: SecCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Код инструмента
 *     responses:
 *       200:
 *         description: Объект с полными данными из Params
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Объект не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get("/details/:ClassCode/:SecCode", getParamsDetails);

export default router;
