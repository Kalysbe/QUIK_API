import express from "express";
import { regenerateOwnKey } from "../controllers/apiKeyController.js";
import { requireDepositoryOrAdmin } from "../middleware/depositoryAuth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ApiKey
 *   description: Управление собственным API-ключом депозитария
 */

/**
 * @swagger
 * /api/api-key/regenerate:
 *   post:
 *     summary: Выпустить себе новый API-ключ
 *     tags: [ApiKey]
 *     security:
 *       - ApiKeyAuth: []
 *     description: |
 *       Выпускает новый API-ключ для депозитария, чей текущий ключ передан в X-API-Key.
 *       Текущий ключ перестаёт работать сразу. Новый ключ показывается один раз — сохраните его
 *       до следующего запроса. Если ключ потерян, новый выдаёт биржа.
 *     responses:
 *       200:
 *         description: Новый ключ в поле api_key
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Выпущен новый API-ключ, прежний больше не действует. Сохраните ключ — повторно он не показывается."
 *               depository: "Центральный депозитарий"
 *               api_key: "dep_..."
 *               api_key_hint: "Xy7Q"
 *       401:
 *         description: Не передан или неверный API-ключ
 *       403:
 *         description: Депозитарий отключён
 */
router.post("/regenerate", requireDepositoryOrAdmin, regenerateOwnKey);

export default router;
