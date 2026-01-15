import express from "express";
import * as sp from "../controllers/securityParamsController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SecurityParams
 *   description: API для управления параметрами инструментов
 */

/**
 * @swagger
 * /api/security-params/fut-step-price:
 *   post:
 *     summary: Установить стоимость шага цены (фьючерс)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, StepPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               StepPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Стоимость шага цены установлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/opt-step-price:
 *   post:
 *     summary: Установить стоимость шага цены (опцион)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, StepPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               StepPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Стоимость шага цены установлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/spread-step-price:
 *   post:
 *     summary: Установить стоимость шага цены (спред)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, StepPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               StepPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Стоимость шага цены установлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/prev-price:
 *   post:
 *     summary: Установить цену закрытия
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, PrevPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               PrevPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Цена закрытия установлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/fut-collateral:
 *   post:
 *     summary: Установить ГО (фьючерс)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, SellDepo, BuyDepo]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               SellDepo:
 *                 type: number
 *               BuyDepo:
 *                 type: number
 *     responses:
 *       200:
 *         description: ГО установлено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/opt-collateral:
 *   post:
 *     summary: Установить ГО (опцион)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, SellDepo, BuyDepo]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               SellDepo:
 *                 type: number
 *               BuyDepo:
 *                 type: number
 *     responses:
 *       200:
 *         description: ГО установлено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/spread-collateral:
 *   post:
 *     summary: Установить ГО (спред)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, SellDepo, BuyDepo]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               SellDepo:
 *                 type: number
 *               BuyDepo:
 *                 type: number
 *     responses:
 *       200:
 *         description: ГО установлено
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/fut-cl-price:
 *   post:
 *     summary: Установить котировку клиринга (фьючерс)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, ClPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               ClPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Котировка клиринга установлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/opt-cl-price:
 *   post:
 *     summary: Установить котировку клиринга (опцион)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, ClPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               ClPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Котировка клиринга установлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 *
 * /api/security-params/spread-cl-price:
 *   post:
 *     summary: Установить котировку клиринга (спред)
 *     tags: [SecurityParams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ClassCode, SecCode, ClPrice]
 *             properties:
 *               ClassCode:
 *                 type: string
 *               SecCode:
 *                 type: string
 *               ClPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Котировка клиринга установлена
 *       400:
 *         description: Ошибка валидации данных
 *       409:
 *         description: Бизнес-ошибка
 *       500:
 *         description: Ошибка сервера
 */
router.post("/fut-step-price", sp.setFutSecurityStepPrice);
router.post("/opt-step-price", sp.setOptSecurityStepPrice);
router.post("/spread-step-price", sp.setSpreadSecurityStepPrice);
router.post("/prev-price", sp.setSecurityPrevPrice);
router.post("/fut-collateral", sp.setFutSecurityCollateral);
router.post("/opt-collateral", sp.setOptSecurityCollateral);
router.post("/spread-collateral", sp.setSpreadSecurityCollateral);
router.post("/fut-cl-price", sp.setFutSecurityClPrice);
router.post("/opt-cl-price", sp.setOptSecurityClPrice);
router.post("/spread-cl-price", sp.setSpreadSecurityClPrice);

export default router;

