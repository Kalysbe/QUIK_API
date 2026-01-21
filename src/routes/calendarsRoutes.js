import express from "express";
import {
    createCalendar,
    createCalendarDate,
    getCalendars,
    getCalendar,
    deleteCalendarDate,
    deleteCalendar,
    linkCalendarToClass,
    linkCalendarToSecurity,
} from "../controllers/calendarsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Calendars
 *   x-hidden: true
 *   description: API для управления календарями
 */

/**
 * @swagger
 * /api/calendars:
 *   post:
 *     summary: Добавить или изменить календарь
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [CalendarName, Enabled]
 *             properties:
 *               CalendarName:
 *                 type: string
 *                 maxLength: 255
 *               Enabled:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Календарь успешно добавлен или изменён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   get:
 *     summary: Получить список календарей
 *     tags: [Calendars]
 *     responses:
 *       200:
 *         description: Список календарей
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить календарь
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [CalendarName]
 *             properties:
 *               CalendarName:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Календарь успешно удалён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/calendars/date:
 *   post:
 *     summary: Добавить или изменить дату календаря
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [CalendarName, Date, TradeIndicator]
 *             properties:
 *               CalendarName:
 *                 type: string
 *               Date:
 *                 type: integer
 *               TradeIndicator:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Дата календаря успешно добавлена или изменена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить дату календаря
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [CalendarName, Date]
 *             properties:
 *               CalendarName:
 *                 type: string
 *               Date:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Дата календаря успешно удалена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/calendars/{calendarName}:
 *   get:
 *     summary: Получить даты календаря
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: calendarName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Даты календаря
 *       500:
 *         description: Ошибка сервера
 *
 * /api/calendars/link-to-class:
 *   post:
 *     summary: Привязать календарь к классу
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, CalendarName]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               CalendarName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Календарь успешно привязан к классу
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/calendars/link-to-security:
 *   post:
 *     summary: Привязать календарь к инструменту
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, CalendarName]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               CalendarName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Календарь успешно привязан к инструменту
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createCalendar);
router.post("/date", createCalendarDate);
router.get("/", getCalendars);
router.get("/:calendarName", getCalendar);
router.delete("/date", deleteCalendarDate);
router.delete("/", deleteCalendar);
router.post("/link-to-class", linkCalendarToClass);
router.post("/link-to-security", linkCalendarToSecurity);

export default router;

