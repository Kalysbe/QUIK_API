import express from "express";
import { createClient, deleteClient } from "../controllers/clientsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: API для управления клиентами
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Добавить клиента
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [FirmCode, ClientCode]
 *             properties:
 *               FirmCode:
 *                 type: string
 *                 maxLength: 12
 *               ClientCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Клиент успешно добавлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить клиента
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [FirmCode, ClientCode]
 *             properties:
 *               FirmCode:
 *                 type: string
 *                 maxLength: 12
 *               ClientCode:
 *                 type: string
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: Клиент успешно удалён
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createClient);
router.delete("/", deleteClient);

export default router;

