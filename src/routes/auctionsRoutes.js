import express from "express";
import * as a from "../controllers/auctionsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auctions
 *   x-hidden: true
 *   description: API для управления аукционами
 */

/**
 * @swagger
 * /api/auctions:
 *   post:
 *     summary: Добавить аукцион
 *     tags: [Auctions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Аукцион добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   put:
 *     summary: Изменить аукцион
 *     tags: [Auctions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Аукцион изменён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить аукцион
 *     tags: [Auctions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [CustomAuctionId]
 *             properties:
 *               CustomAuctionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Аукцион удалён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/auctions/notification-time:
 *   post:
 *     summary: Изменить время нотификации
 *     tags: [Auctions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Время нотификации изменено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/auctions/date-time:
 *   post:
 *     summary: Изменить дату и время аукциона
 *     tags: [Auctions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Расписание изменено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/auctions/time:
 *   post:
 *     summary: Изменить параметры времени аукциона
 *     tags: [Auctions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Время аукциона изменено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", a.addAuctionSchedule);
router.put("/", a.editAuctionSchedule);
router.delete("/", a.deleteAuctionSchedule);
router.post("/notification-time", a.changeAuctionNotificationTime);
router.post("/date-time", a.changeAuctionDateAndTime);
router.post("/time", a.changeAuctionTime);

export default router;

