import express from "express";
import * as tc from "../controllers/tradeCreationController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TradeCreation
 *   description: API для управления генерацией сделок
 */

/**
 * @swagger
 * /api/trade-creation/normal-mode:
 *   post:
 *     summary: Установить обычный режим генерации сделок
 *     tags: [TradeCreation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [FirmCode, ClassCode]
 *             properties:
 *               FirmCode:
 *                 type: string
 *               ClassCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Режим установлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/trade-creation/layer-params:
 *   post:
 *     summary: Установить параметры генерации сделок с брокером
 *     tags: [TradeCreation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [FirmCode, ClassCode, BrokerFirmCode, BrokerAccount, BrokerClientCode]
 *             properties:
 *               FirmCode:
 *                 type: string
 *               ClassCode:
 *                 type: string
 *               BrokerFirmCode:
 *                 type: string
 *               BrokerAccount:
 *                 type: string
 *               BrokerClientCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Параметры установлены
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/trade-creation/broker-quotes-mode:
 *   post:
 *     summary: Установить режим исполнения заявок по котировкам брокера
 *     tags: [TradeCreation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, BrokerFirmCode, BrokerClientCode]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               BrokerFirmCode:
 *                 type: string
 *               BrokerClientCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Режим установлен
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/normal-mode", tc.setClassNormalTradeCreationMode);
router.post("/layer-params", tc.setClassLayerTradeCreationParams);
router.post("/broker-quotes-mode", tc.setClassByBrokerQuotesTradeCreationMode);

export default router;

