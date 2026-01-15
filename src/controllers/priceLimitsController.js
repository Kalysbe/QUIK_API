// controllers/priceLimitsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/price-limits/range
   NewSecurityPriceLimitByRange - Добавление/Изменение минимальной и максимальной цены заявки
   ========================= */
const newSecurityPriceLimitByRangeSchema = z.object({
    ClassCode: z.string().max(12),
    SecCode: z.string().max(12),
    MinPrice: z.number(),
    MaxPrice: z.number(),
});

const newSecurityPriceLimitByRangeTypeMap = {
    ClassCode: sql.VarChar(12),
    SecCode: sql.VarChar(12),
    MinPrice: sql.Float,
    MaxPrice: sql.Float,
};

export const createSecurityPriceLimitByRange = createStoredProcedureHandler(
    newSecurityPriceLimitByRangeSchema,
    "NewSecurityPriceLimitByRange",
    newSecurityPriceLimitByRangeTypeMap,
    [],
    "Ценовое ограничение по диапазону успешно установлено"
);

/* =========================
   POST /api/price-limits/middle-price
   NewSecurityPriceLimitByMiddlePrice - Добавление/Изменение среднего значения цены и процента отклонения
   ========================= */
const newSecurityPriceLimitByMiddlePriceSchema = z.object({
    ClassCode: z.string().max(12),
    SecCode: z.string().max(12),
    MiddlePrice: z.number(),
    LPercent: z.number(),
});

const newSecurityPriceLimitByMiddlePriceTypeMap = {
    ClassCode: sql.VarChar(12),
    SecCode: sql.VarChar(12),
    MiddlePrice: sql.Float,
    LPercent: sql.Float,
};

export const createSecurityPriceLimitByMiddlePrice = createStoredProcedureHandler(
    newSecurityPriceLimitByMiddlePriceSchema,
    "NewSecurityPriceLimitByMiddlePrice",
    newSecurityPriceLimitByMiddlePriceTypeMap,
    [],
    "Ценовое ограничение по среднему значению успешно установлено"
);

/* =========================
   DELETE /api/price-limits
   DelSecurityPriceLimit - Удаление ценового ограничения заявки
   ========================= */
const delSecurityPriceLimitSchema = z.object({
    ClassCode: z.string().max(12),
    SecCode: z.string().max(12),
});

const delSecurityPriceLimitTypeMap = {
    ClassCode: sql.VarChar(12),
    SecCode: sql.VarChar(12),
};

export const deleteSecurityPriceLimit = createStoredProcedureHandler(
    delSecurityPriceLimitSchema,
    "DelSecurityPriceLimit",
    delSecurityPriceLimitTypeMap,
    [],
    "Ценовое ограничение успешно удалено"
);

