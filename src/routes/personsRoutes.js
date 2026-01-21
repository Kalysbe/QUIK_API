import express from "express";
import { createPerson, deletePerson, linkPersonToClient } from "../controllers/personsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Persons
 *   x-hidden: true
 *   description: API для управления физическими лицами
 */

/**
 * @swagger
 * /api/persons:
 *   post:
 *     summary: Добавить или изменить физическое лицо
 *     tags: [Persons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [FirstName, MiddleName, LastName]
 *             properties:
 *               PersonId:
 *                 type: integer
 *                 nullable: true
 *               FirstName:
 *                 type: string
 *               MiddleName:
 *                 type: string
 *               LastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Физическое лицо добавлено или изменено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *   delete:
 *     summary: Удалить физическое лицо
 *     tags: [Persons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [PersonId]
 *             properties:
 *               PersonId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Физическое лицо удалено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/persons/link-to-client:
 *   post:
 *     summary: Привязать физическое лицо к клиенту
 *     tags: [Persons]
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
 *               ClientCode:
 *                 type: string
 *               PersonId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Физическое лицо привязано к клиенту
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", createPerson);
router.delete("/", deletePerson);
router.post("/link-to-client", linkPersonToClient);

export default router;

