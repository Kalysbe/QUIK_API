// controllers/accruedIntController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   AddAccruedInt - Добавление НКД
   ========================= */
export const addAccruedInt = createStoredProcedureHandler(
    z.object({
        SecCode: z.string().max(12),
        Date: z.number().int(),
        ACI: z.number(),
        CurrencyCode: z.string().max(4).nullable().optional(),
    }),
    "AddAccruedInt",
    { SecCode: sql.VarChar(12), Date: sql.Int, ACI: sql.Float, CurrencyCode: sql.VarChar(4) },
    ["CurrencyCode"], "НКД успешно добавлен"
);

/* =========================
   DelAccruedInt - Удаление НКД
   ========================= */
export const delAccruedInt = createStoredProcedureHandler(
    z.object({
        SecCode: z.string().max(12),
        Date: z.number().int(),
        CurrencyCode: z.string().max(4).nullable().optional(),
    }),
    "DelAccruedInt",
    { SecCode: sql.VarChar(12), Date: sql.Int, CurrencyCode: sql.VarChar(4) },
    ["CurrencyCode"], "НКД успешно удалён"
);

/* =========================
   SetAccruedIntCalculateMode - Режим расчета НКД
   ========================= */
export const setAccruedIntCalculateMode = createStoredProcedureHandler(
    z.object({
        AssetCode: z.string().max(12),
        CalcModeACI: z.number().int().nullable().optional(),
    }),
    "SetAccruedIntCalculateMode",
    { AssetCode: sql.VarChar(12), CalcModeACI: sql.Int },
    ["CalcModeACI"], "Режим расчета НКД установлен"
);

