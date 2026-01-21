import express from "express";
import { createBroker } from "../controllers/brokersController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Brokers
 *   x-hidden: true
 *   description: API для управления брокерами
 */

/**
 * @swagger
 * /api/brokers:
 *   post:
 *     summary: Добавить брокера
 *     tags: [Brokers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [FirmCode, BrokerCode]
 *             properties:
 *               FirmCode:
 *                 type: string
 *               BrokerCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Брокер успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createBroker);

export default router;

