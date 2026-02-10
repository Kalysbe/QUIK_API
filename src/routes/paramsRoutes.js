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
 *     description: Возвращает данные из таблицы Params (PostgreSQL) с фильтрацией по любому столбцу.
 *       Фильтры можно передать как query-параметры (имя столбца = значение) или в параметре filters (JSON).
 *     parameters:
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON-строка объекта фильтров по столбцам таблицы Params
 *       - in: query
 *         name: {column_name}
 *         description: Любой столбец таблицы Params — фильтр по равенству
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
