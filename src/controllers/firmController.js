// src/controllers/firmController.js
import Firm from "../models/Firm.js";
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
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
    FirmName: z.string().max(30),
    Permissions: z.number().int(),
    Exchange: z.string().max(12),
});

const newFirmTypeMap = {
    FirmCode: sql.VarChar(12),
    FirmName: sql.VarChar(30),
    Permissions: sql.SmallInt,
    Exchange: sql.VarChar(12),
};

export const createFirm = createStoredProcedureHandler(
    newFirmSchema,
    "NewFirm",
    newFirmTypeMap,
    [],
    "Фирма успешно добавлена"
);

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

