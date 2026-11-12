// src/controllers/apiKeyController.js
// Самостоятельная смена API-ключа депозитарием.
import logger from "../utils/logger.js";
import { regenerateApiKey } from "../repositories/depositoriesRepository.js";

/* =========================
   POST /api/api-key/regenerate
   Выпускает депозитарию новый ключ по текущему; текущий сразу перестаёт работать.
   ========================= */
export async function regenerateOwnKey(req, res, next) {
  try {
    if (req.access.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Ключ администратора задаётся в ADMIN_API_KEY на сервере и через API не меняется.",
        error: "ADMIN_KEY_NOT_ROTATABLE",
      });
    }

    const { id, name } = req.access.depository;
    const result = await regenerateApiKey(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Депозитарий не найден" });
    }

    logger.info("Depository rotated its API key", { depositoryId: id, ip: req.clientIP || req.ip });
    res.json({
      success: true,
      message:
        "Выпущен новый API-ключ, прежний больше не действует. Сохраните ключ — повторно он не показывается.",
      depository: name,
      api_key: result.apiKey,
      api_key_hint: result.depository.api_key_hint,
    });
  } catch (err) {
    next(err);
  }
}
