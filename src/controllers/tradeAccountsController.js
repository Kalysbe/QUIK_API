// controllers/tradeAccountsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/trade-accounts
   NewTradeAccount - Добавление торгового счета
   ========================= */
const newTradeAccountSchema = z.object({
    FirmCode: z.string().max(12),
    Account: z.string().max(12),
});

const newTradeAccountTypeMap = {
    FirmCode: sql.VarChar(12),
    Account: sql.VarChar(12),
};

export const createTradeAccount = createStoredProcedureHandler(
    newTradeAccountSchema,
    "NewTradeAccount",
    newTradeAccountTypeMap,
    [],
    "Торговый счет успешно добавлен"
);

/* =========================
   POST /api/trade-accounts/add-to-class
   AddAccountToClass - Привязывание торгового счета к классу
   ========================= */
const addAccountToClassSchema = z.object({
    FirmCode: z.string().max(12),
    Account: z.string().max(12),
    ClassCode: z.string().max(12),
});

const addAccountToClassTypeMap = {
    FirmCode: sql.VarChar(12),
    Account: sql.VarChar(12),
    ClassCode: sql.VarChar(12),
};

export const addAccountToClass = createStoredProcedureHandler(
    addAccountToClassSchema,
    "AddAccountToClass",
    addAccountToClassTypeMap,
    [],
    "Торговый счет успешно привязан к классу"
);

