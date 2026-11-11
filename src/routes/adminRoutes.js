import express from "express";
import * as admin from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/depositoryAuth.js";

const router = express.Router();

router.use(requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   x-hidden: true
 *   description: |
 *     Управление депозитариями, их API-ключами и правилами доступа (ключ администратора ADMIN_API_KEY).
 *     Веб-интерфейс — /admin.
 */

/**
 * @swagger
 * /api/admin/depositories:
 *   get:
 *     summary: Список депозитариев
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Список
 *   post:
 *     summary: Создать депозитарий (возвращает API-ключ один раз)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "name": "Центральный депозитарий" }
 *     responses:
 *       201:
 *         description: Создан
 */
router.get("/depositories", admin.listDepositories);
router.post("/depositories", admin.createDepository);

/**
 * @swagger
 * /api/admin/depositories/{id}:
 *   patch:
 *     summary: Переименовать / включить / отключить депозитарий
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           example: { "is_active": false }
 *     responses:
 *       200:
 *         description: Обновлён
 *   delete:
 *     summary: Удалить депозитарий вместе с правилами
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Удалён
 */
router.patch("/depositories/:id", admin.updateDepository);
router.delete("/depositories/:id", admin.deleteDepository);

/**
 * @swagger
 * /api/admin/depositories/{id}/regenerate-key:
 *   post:
 *     summary: Выпустить новый API-ключ (старый перестаёт работать)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Новый ключ в поле api_key
 * /api/admin/depositories/{id}/revoke-key:
 *   post:
 *     summary: Отозвать API-ключ
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ключ отозван
 */
router.post("/depositories/:id/regenerate-key", admin.regenerateKey);
router.post("/depositories/:id/revoke-key", admin.revokeKey);

/**
 * @swagger
 * /api/admin/rules:
 *   get:
 *     summary: Правила принадлежности данных
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Список правил
 *   post:
 *     summary: Добавить правило
 *     description: |
 *       resource: depo_account (DepoLimits.Trdacc), money_tag (MoneyLimits.Tag), trade_class (Trades.ClassCode).
 *       match_type: exact, prefix, contains, default (все остальные значения ресурса).
 *       Одно правило может принадлежать только одному депозитарию.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "depository_id": 1, "resource": "depo_account", "match_type": "contains", "value": "1-3101" }
 *     responses:
 *       201:
 *         description: Создано
 *       409:
 *         description: Правило уже назначено
 */
router.get("/rules", admin.listRules);
router.post("/rules", admin.createRule);

/**
 * @swagger
 * /api/admin/rules/{id}:
 *   delete:
 *     summary: Удалить правило
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Удалено
 */
router.delete("/rules/:id", admin.deleteRule);

/**
 * @swagger
 * /api/admin/coverage:
 *   get:
 *     summary: Кому принадлежит каждый счёт, тэг и класс из базы
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Значения с владельцем (depository_id = null — не видит никто)
 * /api/admin/resolve:
 *   get:
 *     summary: Проверить, какому депозитарию принадлежит значение
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: resource
 *         required: true
 *         schema: { type: string, enum: [depo_account, money_tag, trade_class] }
 *       - in: query
 *         name: value
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Владелец или null
 */
router.get("/classes", admin.listClasses);
router.get("/tags", admin.listTags);
router.get("/coverage", admin.getCoverage);
router.get("/resolve", admin.resolveValue);

export default router;
