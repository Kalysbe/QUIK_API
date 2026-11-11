import { timingSafeEqual } from "crypto";
import logger from "../utils/logger.js";
import { findDepositoryByApiKey, hashApiKey, listRules } from "../repositories/depositoriesRepository.js";

function readApiKey(req) {
  const header = req.headers["x-api-key"];
  const key = Array.isArray(header) ? header[0] : header;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

function isAdminKey(key) {
  const adminKey = process.env.ADMIN_API_KEY?.trim();
  if (!adminKey || !key) return false;
  // Сравниваем хэши одинаковой длины, чтобы не раскрывать длину ключа по времени ответа
  return timingSafeEqual(Buffer.from(hashApiKey(key)), Buffer.from(hashApiKey(adminKey)));
}

function unauthorized(res, message) {
  return res.status(401).json({ success: false, message, error: "UNAUTHORIZED" });
}

function forbidden(res, message) {
  return res.status(403).json({ success: false, message, error: "FORBIDDEN" });
}

/**
 * Доступ депозитария (по его API-ключу) или администратора (ADMIN_API_KEY).
 * Кладёт в req.access контекст для фильтрации данных.
 */
export async function requireDepositoryOrAdmin(req, res, next) {
  try {
    const key = readApiKey(req);
    if (!key) {
      return unauthorized(res, "Требуется API-ключ в заголовке X-API-Key");
    }

    if (isAdminKey(key)) {
      req.access = { isAdmin: true };
      req.user = { id: "admin", role: "admin" };
      return next();
    }

    const depository = await findDepositoryByApiKey(key);
    if (!depository) {
      logger.warn("Invalid API key", { ip: req.clientIP || req.ip, path: req.originalUrl });
      return unauthorized(res, "Неверный API-ключ");
    }
    if (!depository.is_active) {
      return forbidden(res, "Доступ депозитария отключён");
    }

    req.access = {
      isAdmin: false,
      depository: { id: depository.id, name: depository.name },
      rules: await listRules(),
    };
    req.user = { id: `depository:${depository.id}`, role: "depository" };
    return next();
  } catch (error) {
    return next(error);
  }
}

/** Только администратор (ADMIN_API_KEY). */
export function requireAdmin(req, res, next) {
  const key = readApiKey(req);
  if (!key) {
    return unauthorized(res, "Требуется API-ключ администратора в заголовке X-API-Key");
  }
  if (!isAdminKey(key)) {
    return forbidden(res, "Нужен API-ключ администратора");
  }
  req.access = { isAdmin: true };
  req.user = { id: "admin", role: "admin" };
  return next();
}
