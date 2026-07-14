// src/controllers/firmController.js
import Firm from "../models/Firm.js";
import { z } from "zod";
import { createStoredProcedureHandler, executeStoredProcedure } from "../utils/storedProcedureHelper.js";
import { getMssqlPool, sql } from "../config/dbMssql.js";

/* =========================
   GET /firms
   ========================= */
export async function getFirms(req, res, next) {
  try {
    const { firmId } = req.query;
    const options = {
      raw: true,
      order: [["FirmId", "ASC"]],
    };
    if (firmId != null && String(firmId).trim() !== "") {
      options.where = { FirmId: String(firmId).trim() };
    }
    const firms = await Firm.findAll(options);
    res.json(firms);
  } catch (err) {
    next(err);
  }
}

/* =========================
   POST /api/firms
   NewFirm - Добавление фирмы
   ========================= */
const newFirmSchema = z.object({
    FirmCode: z.string().max(12),
    FirmName: z.string().max(128),
    Permissions: z.number().int(),
    Exchange: z.string().max(12),
});

const newFirmTypeMap = {
    FirmCode: sql.VarChar(12),
    FirmName: sql.VarChar(128),
    Permissions: sql.SmallInt,
    Exchange: sql.VarChar(12),
};

/**
 * Идемпотентное создание: если фирма уже есть в MSSQL (QME),
 * возвращаем 200 вместо 409/500 — типичный кейс синхронизации,
 * когда PostgreSQL-экспорт ещё не успел подтянуть FirmId.
 */
export async function createFirm(req, res, next) {
  try {
    const parsed = newFirmSchema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error?.issues || [];
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors: issues.map((e) => ({
          field: e.path?.join(".") || "",
          message: e.message || "Ошибка валидации",
        })),
      });
    }

    const data = parsed.data;
    const pool = await getMssqlPool();
    const existing = await pool
      .request()
      .input("FirmCode", sql.VarChar(12), data.FirmCode)
      .query("SELECT FirmCode, FirmName, Exchange FROM Firms WHERE FirmCode = @FirmCode");

    if (existing.recordset?.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Фирма уже существует",
        alreadyExists: true,
        firm: existing.recordset[0],
      });
    }

    return await executeStoredProcedure(
      "NewFirm",
      data,
      newFirmTypeMap,
      [],
      res,
      next,
      "Фирма успешно добавлена"
    );
  } catch (error) {
    return next(error);
  }
}

/* =========================
   POST /api/firms/add-to-class
   AddFirmToClass - Привязывание фирмы к классу
   ========================= */
const addFirmToClassSchema = z.object({
    FirmCode: z.string().max(12),
    ClassCode: z.string().max(12),
});

const addFirmToClassTypeMap = {
    FirmCode: sql.VarChar(12),
    ClassCode: sql.VarChar(12),
};

export const addFirmToClass = createStoredProcedureHandler(
    addFirmToClassSchema,
    "AddFirmToClass",
    addFirmToClassTypeMap,
    [],
    "Фирма успешно привязана к классу"
);
