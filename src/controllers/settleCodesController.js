// controllers/settleCodesController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/settle-codes
   NewSettleCode - Добавление/Изменение кода расчетов
   ========================= */
const newSettleCodeSchema = z.object({
    SettleCode: z.string().max(12),
    SettleDays: z.number().int(),
});

const newSettleCodeTypeMap = {
    SettleCode: sql.VarChar(12),
    SettleDays: sql.Int,
};

export const createSettleCode = createStoredProcedureHandler(
    newSettleCodeSchema,
    "NewSettleCode",
    newSettleCodeTypeMap,
    [],
    "Код расчетов успешно добавлен или изменён"
);

/* =========================
   DELETE /api/settle-codes
   DelSettleCode - Удаление кода расчетов
   ========================= */
const delSettleCodeSchema = z.object({
    SettleCode: z.string().max(12),
});

const delSettleCodeTypeMap = {
    SettleCode: sql.VarChar(12),
};

export const deleteSettleCode = createStoredProcedureHandler(
    delSettleCodeSchema,
    "DelSettleCode",
    delSettleCodeTypeMap,
    [],
    "Код расчетов успешно удалён"
);

/* =========================
   POST /api/settle-codes/set-class
   SetClassSettleCode - Привязывание кода расчетов к классу
   ========================= */
const setClassSettleCodeSchema = z.object({
    ClassCode: z.string().max(12),
    SettleCode: z.string().max(12),
});

const setClassSettleCodeTypeMap = {
    ClassCode: sql.VarChar(12),
    SettleCode: sql.VarChar(12),
};

export const setClassSettleCode = createStoredProcedureHandler(
    setClassSettleCodeSchema,
    "SetClassSettleCode",
    setClassSettleCodeTypeMap,
    [],
    "Код расчетов успешно привязан к классу"
);

/* =========================
   POST /api/settle-codes/set-security
   SetSecuritySettleCode - Привязывание кода расчетов к инструменту
   ========================= */
const setSecuritySettleCodeSchema = z.object({
    ClassCode: z.string().max(12),
    SecCode: z.string().max(12),
    SettleCode: z.string().max(12),
});

const setSecuritySettleCodeTypeMap = {
    ClassCode: sql.VarChar(12),
    SecCode: sql.VarChar(12),
    SettleCode: sql.VarChar(12),
};

export const setSecuritySettleCode = createStoredProcedureHandler(
    setSecuritySettleCodeSchema,
    "SetSecuritySettleCode",
    setSecuritySettleCodeTypeMap,
    [],
    "Код расчетов успешно привязан к инструменту"
);

